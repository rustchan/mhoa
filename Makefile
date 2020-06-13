.PHONY: build
build:
	npm run build
	docker build -t mhadmin .
	docker tag mhadmin registry.cn-shanghai.aliyuncs.com/mhiot/mhadmin
	docker login --username=gorust@qq.com registry.cn-shanghai.aliyuncs.com
	docker push registry.cn-shanghai.aliyuncs.com/mhiot/mhadmin
	docker rmi -f registry.cn-shanghai.aliyuncs.com/mhiot/mhadmin
