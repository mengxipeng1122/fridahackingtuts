'use strict';

// store load buffer to global variable to void frida's GC to release loaded buffer
export let loadBuff =ptr(0);

export type SoInfoType = {
    machine_type: string,
    load_size : number,
    name?: string,

    loads?: {
        virtual_address:number,
        virtual_size   :number,
        alignment      :number,
        file_offset    :number,
        size           :number,
        content        :number[],
    }[],

    exported_symbols    :{name:string, address:number}[],
    imported_symbols?   :{name:string, address:number}[],
    relocations?: {address:number, addend:number, size:number, sym_name:string, type:number}[],
    ctor_functions?: number[],
    dtor_functions?: number[],
};

export type LoadSoInfoType = {
    buff: NativePointer,
    syms: {[key:string]:NativePointer},
};

function resolveSymbol(sym_name:string, exportSyms?:{[key:string]:NativePointer}, syms?:{[key:string]:NativePointer}, libs?:string[] ){
    if (exportSyms!=undefined && sym_name in exportSyms) return exportSyms[sym_name];
    if (syms!=undefined && sym_name in syms) return syms[sym_name];
    {
        let found = false;
        let symp = ptr(0);
        if(libs!=undefined){
            libs.forEach(soname=>{
                if(found) return;

                let p = Module.findExportByName(soname,sym_name);
                if(p!=undefined&&!p.equals(0)) {found=true; symp=p;}
                if(found) return;

                let m = Process.getModuleByName(soname);
                if(m!=undefined){
                    m.enumerateSymbols()
                        .filter(e=>{
                            return e.name==sym_name;
                        })
                        .forEach(e=>{
                            found=true;
                            symp=e.address;
                        })
                }
                if(found) return;
            })
        }
        if(found) return symp;
    }
    {
        let p = Module.findExportByName(null, sym_name);
        if(p!=undefined&&!p.equals(0)) return p;
    }
}

export function loadSo(info:SoInfoType, syms?:{[key:string]:NativePointer}, libs?:string[]):LoadSoInfoType
{
    // sanity check arctecture
    let arch = Process.arch;
    if(arch=='arm'){
        if(info.machine_type!='ARM')  throw `archtecture mismatch ${info.machine_type}/${Process.arch}`
    }
    else if (arch=='arm64'){
        if(info.machine_type!='AARCH64')  throw `archtecture mismatch ${info.machine_type}/${Process.arch}`
    }
    else{
        throw `unsupported archtecture ${arch}`
    }

    let buff = Memory.alloc(info.load_size);
    loadBuff=buff;
    Memory.protect(buff, info.load_size, 'rwx');
    // allocate memory fot new so
    if(info.loads!=undefined)
    {
        info.loads.forEach(l=>{
            // load 
            buff.add(l.virtual_address).writeByteArray(l.content);
        })
    }

    // handle export syms
    let exportSyms:{[key:string]:NativePointer} ={};
    {
        info.exported_symbols.forEach(s=>{
            let p = buff.add(s.address);
            exportSyms[s.name] = p;
        })
    }

    // handle relocations for hot patch 
    if(info.relocations!=undefined)
    {
        info.relocations.forEach(r=>{
            if (r.type==23) { // R_ARM_RELATIVE
                if(r.size != 32) throw `only support for 32bits now`
                let p =buff.add(r.address).readPointer();
                buff.add(r.address).writePointer(p.add(buff));
            }
            else if (r.type==21) { // R_ARM_GLOB_DAT
                if(r.size != 32) throw `only support for 32bits now`
                let p = resolveSymbol(r.sym_name, exportSyms, syms, libs);
                if(p!=undefined&&!p.equals(0)){
                    buff.add(r.address).writePointer(p) ;
                }
                else{
                    throw(`can not found sym ${r.sym_name}`)
                }
            }
            else if (r.type==22) { // R_ARM_JUMP_SLOT
                if(r.size != 32) throw `only support for 32bits now`
                let p = resolveSymbol(r.sym_name, exportSyms, syms, libs);
                if(p!=undefined&&!p.equals(0)){
                    buff.add(r.address).writePointer(p) ;
                }
                else{
                    throw(`can not found sym ${r.sym_name}`)
                }
            }
            else if (r.type==2) { // R_ARM_ABS32
                if(r.size != 32) throw `only support for 32bits now`
                let p = resolveSymbol(r.sym_name, exportSyms, syms, libs);
                if(p!=undefined&&!p.equals(0)){
                    buff.add(r.address).writePointer(p) ;
                }
                else{
                    throw(`can not found sym ${r.sym_name}`)
                }
            }
            else if (r.type==257) { // R_AARCH64_ABS64
                if(r.size != 64) throw `only support for 64bits now`
                let p = resolveSymbol(r.sym_name, exportSyms, syms, libs);
                if(p!=undefined&&!p.equals(0)){
                    buff.add(r.address).writePointer(p);
                }else{
                    throw(`can not found sym ${r.sym_name}`)
                }
            }
            else if (r.type==1025) { // R_AARCH64_GLOB_DA
                if(r.size != 64) throw `only support for 64bits now`
                let p = resolveSymbol(r.sym_name, exportSyms, syms, libs);
                if(p!=undefined&&!p.equals(0)){
                    buff.add(r.address).writePointer(p);
                }
                else {
                    throw(`can not found sym ${r.sym_name}`)
                }
            }
            else if (r.type==1026) { // R_AARCH64_JUMP_SL
                if(r.size != 64) throw `only support for 64bits now`
                let p = resolveSymbol(r.sym_name, exportSyms, syms, libs);
                if(p!=undefined&&!p.equals(0)) {
                    buff.add(r.address).writePointer(p);
                }
                else{
                    throw(`can not found sym ${r.sym_name}`)
                }
            }
            else if (r.type==1027) { // R_AARCH64_RELATIV
                if(r.size != 64) throw `only support for 64bits now`
                let p =buff.add(r.address).readPointer();
                buff.add(r.address).writePointer(buff.add(r.addend));
            }
            else{
                throw `unhandle relocation type ${r.type}`
            }
        })
    }
    // handle ctor_functions
    if(info.ctor_functions!=undefined)
    {
        info.ctor_functions.forEach(a=>{
            let p = buff.add(a)
            let fun = new NativeFunction(p, 'void', []);
            console.log('call ctor', p, ptr(a));
            fun()
        })
    }

    return {buff:buff, syms:exportSyms};
}

