
UNAME :=$(shell uname)

# TODO: replace this variable to your actual Android NDK path
NDKPATH=/mnt/axly/hackings/android-utils/android-ndk-r15c/

ANDROID_ABI=`adb shell getprop ro.product.cpu.abi | awk -F',' '{print $$NF}'`

all: build
	cp ../libs/${ANDROID_ABI}/* /tmp

build:
	${NDKPATH}/ndk-build V=1 

clean:
	${NDKPATH}/ndk-build clean 

install: all
	echo ${ANDROID_ABI}
	#adb push ../libs/${ANDROID_ABI}/* /data/local/tmp;  

