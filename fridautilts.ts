
export let frida_log_callback = new NativeCallback(function(sp:NativePointer){
    let s = sp.readUtf8String();
    console.log(s)
},'void', ['pointer'])

export let frida_log_cstring_callback = new NativeCallback(function(pString:NativePointer){
    let s = pString.add(0x0).readPointer().readUtf8String(); // get string to a pointer to a std::string object
    console.log(s)
},'void', ['pointer'])

export let frida_hexdump_callback = new NativeCallback(function(sp:NativePointer, size:number){
    console.log('dump memory', sp, ' of size ', size)
    console.log(hexdump(sp,{
        offset: 0,
        length: 64,
        header: true,
        ansi: true
    }))
},'void', ['pointer','int'])
//////////////////////////////////////////////////
// This function tries to TS code with exception handing 
//////////////////////////////////////////////////
// This function tries to TS code with exception handing 
// augments:
//         f   -- typescript method to run
//         cb  -- user defined exception handle function
export let runFunWithExceptHandling = function(f:()=>void, cb?:(pe:Error)=>void){
    try{
        f();
    }
    catch(_e){
        // show errors
        let e:Error= _e as Error;
        console.log('error occur')
        console.log(JSON.stringify(e))
        if ((e as any).context != undefined) {
            let context = (e as any).context;
            console.log('called from:\n' +
                Thread.backtrace(context, Backtracer.ACCURATE)
                    .map(DebugSymbol.fromAddress).join('\n') + '\n');
        }
        if(cb!=undefined) cb(e)
    }
}

