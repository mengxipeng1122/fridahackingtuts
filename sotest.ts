
import * as fridautils from './fridautilts'
import * as mysoinfo from './mysoinfo'
import * as soutils from './soutils'

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

    fridautils.runFunWithExceptHandling(()=>{
        let fun = new NativeFunction(loadm.syms.fun,'void',[])
        fun();
    })
}

console.log("Hello world");
test0();
