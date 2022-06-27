
PACKAGE_NAME=com.ketchapp.knifehit
APP_TITLE="Knife Hit"

build_cmoudletest:
	npm run build_cmoudletest

run:
	frida -U -n ${APP_TITLE} -l _agent.js --no-pause

	
