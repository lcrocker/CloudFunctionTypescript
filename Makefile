.PHONY: all clean test lint deploy

all:	index.js

index.js: src/*.ts
	npx tsc

clean:
	rm *.js *.js.map
	# rm -rf node_modules

test:	index.js
	npm start

lint:
	npx eslint src/*.ts

deploy:	index.js
	gcloud functions deploy <function> --entry-point <function> --runtime nodejs14 --trigger-http --service-account <serviceaccount> --allow-unauthenticated
