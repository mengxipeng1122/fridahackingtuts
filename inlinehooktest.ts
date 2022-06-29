
import * as fridautils from './fridautilts'
import * as mysoinfo from './mysoinfo'
import * as soutils from './soutils'
import * as patchutils from './patchutils'



//////////////////////////////////////////////////
// this method tries to demostrate how to write a CMoudle in Frida, and run it 
let test0 = function() {
    let soname ="libMyGame.so"
    let m = Process.getModuleByName(soname)
    let loadm = soutils.loadSo(
        mysoinfo.info,
        {
            frida_log_callback : fridautils.frida_log_callback,
            frida_hexdump_callback : fridautils.frida_hexdump_callback,
        },
        [
            soname,
        ]
    );
    console.log(JSON.stringify(loadm))
    // inline hook
    {
        let hook_ptr = m.base.add(0x267782);
        let trampoline_ptr = m.base.add(0x691630);
        let hook_fun_ptr = loadm.syms.hook_fun;
        let para1 = m.base;
        let origin_inst = [ 0x30, 0x46, 0x9a, 0x42];
        // hook address 
        patchutils.putThumbHookPatch(trampoline_ptr, hook_ptr, hook_fun_ptr,para1, origin_inst)
    }
    fridautils.runFunWithExceptHandling(()=>{
        let fun = new NativeFunction(loadm.syms.fun,'void',[])
        fun();
    })
}

console.log("Hello world");
test0();
