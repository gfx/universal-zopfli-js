EMCC := emcc
EMCC_OPTIMIZATION_FLAGS := -O3

CC = $(EMCC)
CCFLAGS = --bind -s WASM=1 $(EMCC_OPTIMIZATION_FLAGS) \
	-s NO_FILESYSTEM=1 \
	--pre-js src/pre.js \
	-W -Wall

C_FILES = $(wildcard zopfli/src/zopfli/*.c)
CPP_FILES = $(wildcard src/*.cpp)
OBJ_FILES = $(CPP_FILES:.cpp=.o) $(C_FILES:.c=.o)

DOCKER_IMAGE = zopfli_js

build-with-docker:
	docker build  . -t $(DOCKER_IMAGE)
	docker run -v "$(PWD):/src" -t $(DOCKER_IMAGE) make test
	rm -rf dist

test: all
	node test/test.js

all: dist/libzopfli.js dist/libzopfli-wasm.json dist/index.js

dist/index.js: src/index.ts
	node_modules/.bin/tsc

.c.o:
	$(CC) -I zopfli/src/zopfli -c $< -o $@

.cpp.o:
	$(CC) -I zopfli/src/zopfli -c $< -o $@ -std=c++11

dist/libzopfli-wasm.json: dist/libzopfli.js
	node tools/binary-to-json $(<:.js=.wasm) > dist/libzopfli-wasm.json
	rm $(<:.js=.wasm)

dist/libzopfli.js: $(OBJ_FILES)
	mkdir -p dist/
	$(CC) $(CCFLAGS) $^ -o $@

rebuild: clean all

clean:
	rm -rf $(OBJ_FILES) dist/
