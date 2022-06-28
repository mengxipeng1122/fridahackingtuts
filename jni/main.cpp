
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


