.PHONY: build
build:
	npm run build
	docker build -t mhoa .
	docker tag mhoa ccr.ccs.tencentyun.com/mhiot/mhoa
	docker login --username=6305884 ccr.ccs.tencentyun.com
	docker push ccr.ccs.tencentyun.com/mhiot/mhoa
	docker rmi -f ccr.ccs.tencentyun.com/mhiot/mhoa
	docker rmi -f mhoa
