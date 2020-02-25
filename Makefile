.PHONY: build
build:
	npm run build
	docker build -t mhadmin .
	docker save -o ./mhadmin.tar mhadmin:latest
