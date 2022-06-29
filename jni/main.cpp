
#include <string>

//////////////////////////////////////////////////
// declaration of functions in frida
extern "C" void frida_log_callback(const char*);
extern "C" void frida_hexdump_callback(void*, unsigned int);

//////////////////////////////////////////////////
// declaration of functions in libMyGame.so
namespace cocos2d{
    struct Application {
        static Application* getInstance();
        std::string&  getVersion();
    };
};


extern "C" void fun(void)
{
    frida_log_callback("Hello World from so");
    frida_log_callback("cocos2d application version:");
    const std::string& version  = cocos2d::Application::getInstance()->getVersion();
    frida_log_callback(version.c_str());
    return ;
}

int showThumbRegs(void* sp)
{
    char buf[PATH_MAX];
    sprintf(buf, " CPSR  0x%08x", ((unsigned int*)sp)[0 ]); frida_log_callback(buf);
    sprintf(buf, " R8    0x%08x", ((unsigned int*)sp)[1 ]); frida_log_callback(buf);
    sprintf(buf, " R9    0x%08x", ((unsigned int*)sp)[2 ]); frida_log_callback(buf);
    sprintf(buf, " R10   0x%08x", ((unsigned int*)sp)[3 ]); frida_log_callback(buf);
    sprintf(buf, " R11   0x%08x", ((unsigned int*)sp)[4 ]); frida_log_callback(buf);
    sprintf(buf, " R12   0x%08x", ((unsigned int*)sp)[5 ]); frida_log_callback(buf);
    sprintf(buf, " LR    0x%08x", ((unsigned int*)sp)[6 ]); frida_log_callback(buf);
    sprintf(buf, " R0    0x%08x", ((unsigned int*)sp)[7 ]); frida_log_callback(buf);
    sprintf(buf, " R1    0x%08x", ((unsigned int*)sp)[8 ]); frida_log_callback(buf);
    sprintf(buf, " R2    0x%08x", ((unsigned int*)sp)[9 ]); frida_log_callback(buf);
    sprintf(buf, " R3    0x%08x", ((unsigned int*)sp)[10]); frida_log_callback(buf);
    sprintf(buf, " R4    0x%08x", ((unsigned int*)sp)[11]); frida_log_callback(buf);
    sprintf(buf, " R5    0x%08x", ((unsigned int*)sp)[12]); frida_log_callback(buf);
    sprintf(buf, " R6    0x%08x", ((unsigned int*)sp)[13]); frida_log_callback(buf);
    sprintf(buf, " R7    0x%08x", ((unsigned int*)sp)[14]); frida_log_callback(buf);
    return 0;
}

extern "C" void hook_fun(void* baseaddress, void* sp)
{
    frida_log_callback("#################### Hook Begin ##############################");
    char buf[PATH_MAX];
    frida_log_callback("hook function from so");
    // show parameter 1
    sprintf(buf, "baseaddress %p", baseaddress); frida_log_callback(buf);
    // show registers
    showThumbRegs(sp);
    frida_log_callback("#################### Hook end ##############################");
    return ;
}


__attribute__((constructor))
static void constructor_test0() {
    frida_log_callback("call constructor_test0 ");
}

__attribute__((destructor))
static void destructor_test0() {
    frida_log_callback("call destructor_test0 ");
}


