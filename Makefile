# <copied from="zopfli/Makefile">
ZOPFLILIB_SRC = src/zopfli/blocksplitter.c src/zopfli/cache.c\
                src/zopfli/deflate.c src/zopfli/gzip_container.c\
                src/zopfli/hash.c src/zopfli/katajainen.c\
                src/zopfli/lz77.c src/zopfli/squeeze.c\
                src/zopfli/tree.c src/zopfli/util.c\
                src/zopfli/zlib_container.c src/zopfli/zopfli_lib.c
ZOPFLILIB_OBJ := $(patsubst src/zopfli/%.c,%.o,$(ZOPFLILIB_SRC))
ZOPFLIBIN_SRC := src/zopfli/zopfli_bin.c
LODEPNG_SRC := src/zopflipng/lodepng/lodepng.cpp src/zopflipng/lodepng/lodepng_util.cpp
ZOPFLIPNGLIB_SRC := src/zopflipng/zopflipng_lib.cc
ZOPFLIPNGBIN_SRC := src/zopflipng/zopflipng_bin.cc
# </copied>


# specify -Oz for release
EMCC_OPTIMIZATION_FLAGS := -O0 -s ASSERTIONS=2
EMCC_RELEASE_OPTIMIZATION_FLAGS := -O3 -DNDEBUG -s ASSERTIONS=0

CC := emcc
CCFLAGS = -s WASM=1 \
	$(EMCC_OPTIMIZATION_FLAGS) \
	-s NO_FILESYSTEM=1 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS='[]' \
	-s STRICT=1 \
	-s EXTRA_EXPORTED_RUNTIME_METHODS='["allocate","intArrayFromString","ALLOC_NORMAL"]' \
	--pre-js src/pre.js \
	-W -Wextra -Wall -Wno-unused-function


C_FILES = $(patsubst %,zopfli/%,$(ZOPFLILIB_SRC)) $(wildcard src/*.c)
OBJ_FILES = $(C_FILES:.c=.o) $(CPP_FILES:.cpp=.o)

DOCKER_IMAGE = zopfli_js

test: all
	rm -rf test/*.js test/*.js.map test/*.d.ts
	node_modules/.bin/tsc -p test/tsconfig.json
	node_modules/.bin/ava

test-with-docker:
	docker build  . -t $(DOCKER_IMAGE)
	docker run -v "$(PWD):/src" -t $(DOCKER_IMAGE) make test

release-dist:
	make clean
	make test \
		EMCC_OPTIMIZATION_FLAGS="$(EMCC_RELEASE_OPTIMIZATION_FLAGS)"

publish: release-dist
	@if [ -z "$(VERSION)" ] ; then echo "specify VERSION=major|minor|patch"; exit 1; fi
	npm version --allow-same-version $(VERSION)
	npm publish
	git push origin master
	git push --tags

benchmark-with-optimization: release-dist
	node benchmark/random-bytes.js

benchmark-without-optimization: clean all
	node benchmark/random-bytes.js

all: dist/libzopfli.js dist/libzopfli-wasm.json dist/index.js

dist/index.js: src/index.ts
	node_modules/.bin/tsc

.c.o:
	$(CC) $(CCFLAGS) -I zopfli/src/zopfli -c $< -o $@

.cpp.o:
	$(CC) $(CCFLAGS) -std=c++14 -I zopfli/src/zopfli -c $< -o $@

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
