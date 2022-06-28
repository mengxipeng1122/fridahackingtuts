
PACKAGE_NAME=com.ketchapp.knifehit
APP_TITLE="Knife Hit"

build_sotest:
	(cd jni; make );
	./pyscripts/so2tsmodule.py libs/armeabi-v7a/libmyso.so -o mysoinfo.ts
	npm run build_sotest;

build_cmoduletest:
	npm run build_cmoduletest

run:
	frida -U -n ${APP_TITLE} -l _agent.js --no-pause

	
