
PACKAGE_NAME=com.ketchapp.knifehit
APP_TITLE="Knife Hit"

build_cmoduletest:
	npm run build_cmoduletest

run:
	frida -U -n ${APP_TITLE} -l _agent.js --no-pause

	
