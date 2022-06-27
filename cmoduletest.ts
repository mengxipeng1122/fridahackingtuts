
import * as fridautils from './fridautilts'

//////////////////////////////////////////////////
// this method tries to demostrate how to write a CMoudle in Frida, and run it 
let test0 = function() {
    let soname ="libMyGame.so"
    let m = Process.getModuleByName(soname)

    let loadm = new CModule(`
        void* _ZN7cocos2d11Application11getInstanceEv ();
        const char* _ZN7cocos2d11Application10getVersionEv(void*);
        extern void frida_log_callback(const char* s);
        extern void frida_log_cstring_callback(void*);
        void fun(void) {
            frida_log_callback("Hello World from CModule");
            void* pApplication = _ZN7cocos2d11Application11getInstanceEv();
            const char* version = _ZN7cocos2d11Application10getVersionEv(pApplication);
            frida_log_callback("cocos2d application version: ");
            frida_log_cstring_callback((void*)version);
        }
    `,
    {
      frida_log_callback  : fridautils.frida_log_callback,
      frida_log_cstring_callback  : fridautils.frida_log_cstring_callback,
      // cocos2d::Application::getInstance
      // use this static function  to get a pointer to the current Application instance
      _ZN7cocos2d11Application11getInstanceEv : m.getExportByName("_ZN7cocos2d11Application11getInstanceEv"), 
      // const char* cocos2d::Application::getVersion(void*)
      // use this member function of class Application to get a version string 
      _ZN7cocos2d11Application10getVersionEv: m.getExportByName("_ZN7cocos2d11Application10getVersionEv"), 
    });

    console.log(JSON.stringify(loadm));
    fridautils.runFunWithExceptHandling(()=>{
        let fun = new NativeFunction(loadm.fun, 'void',[])
        fun();
    })
}

console.log("Hello world");
test0();
