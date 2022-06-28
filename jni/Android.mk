LOCAL_PATH := $(call my-dir)

# TODO: replace this variable to the actual path of files of uncompressed APK
APK_UNCOMPRESSED_PATH := ../bins/com.ketchapp.knifehit/
TARGET_ARCH_ABI_MACRO :=$(shell echo ${TARGET_ARCH_ABI} | tr \- _ | tr [:lower:] [:upper:])

include $(CLEAR_VARS)
LOCAL_MODULE:= MyGame
LOCAL_SRC_FILES := ${APK_UNCOMPRESSED_PATH}/lib/$(TARGET_ARCH_ABI)/libMyGame.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE:= myso
LOCAL_SRC_FILES := main.cpp
LOCAL_C_INCLUDES := 
LOCAL_LDLIBS :=  -lGLESv2 -llog  -landroid -lz
LOCAL_CXXFLAGS= -fdeclspec -fno-exceptions -fno-stack-protector -z execstack -std=c++14 
#LOCAL_ARM_MODE=arm
LOCAL_ALLOW_UNDEFINED_SYMBOLS := true
#LOCAL_ARM_NEON := true
LOCAL_SHARED_LIBRARIES = MyGame
LOCAL_DISABLE_FATAL_LINKER_WARNINGS := true
include $(BUILD_SHARED_LIBRARY)


