EMCC := emcc

# specify -Oz for release
EMCC_OPTIMIZATION_FLAGS := -O0 -s ASSERTIONS=2

CC = $(EMCC)
CCFLAGS = -s WASM=1 $(EMCC_OPTIMIZATION_FLAGS) \
	-s NO_FILESYSTEM=1 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS='[]' \
	-s STRICT=1 \
	--pre-js src/pre.js \
	-W -Wall

C_FILES = $(wildcard zopfli/src/zopfli/*.c)  $(wildcard src/*.c)
OBJ_FILES = $(C_FILES:.c=.o)

DOCKER_IMAGE = zopfli_js

test: all
	rm -rf test/*.js test/*.js.map test/*.d.ts
	npm test

test-with-docker:
	docker build  . -t $(DOCKER_IMAGE)
	docker run -v "$(PWD):/src" -t $(DOCKER_IMAGE) make test

all: dist/libzopfli.js dist/libzopfli-wasm.json dist/index.js

dist/index.js: src/index.ts
	node_modules/.bin/tsc

.c.o:
	$(CC) -W -I zopfli/src/zopfli -c $< -o $@

dist/libzopfli-wasm.json: dist/libzopfli.js
	mkdir -p dist/
	node tools/binary-to-json $(<:.js=.wasm) > dist/libzopfli-wasm.json
	rm $(<:.js=.wasm)

dist/libzopfli.js: $(OBJ_FILES)
	mkdir -p dist/
	$(CC) $(CCFLAGS) $^ -o $@

rebuild: clean all

clean:
	rm -rf $(OBJ_FILES) dist/
