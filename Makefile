# specify -Oz for release
EMCC_OPTIMIZATION_FLAGS := -O0  -s ASSERTIONS=2
EMCC_RELEASE_OPTIMIZATION_FLAGS := -Oz -DNDEBUG -s ASSERTIONS=0

CC := emcc
CCFLAGS = -s WASM=1 \
	$(EMCC_OPTIMIZATION_FLAGS) \
	-s NO_FILESYSTEM=1 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS='[]' \
	-s STRICT=1 \
	--pre-js src/pre.js \
	-W -Wextra -Wall -Wno-unused-function


C_FILES = $(wildcard zopfli/src/zopfli/*.c)  $(wildcard src/*.c)
OBJ_FILES = $(C_FILES:.c=.o)

DOCKER_IMAGE = zopfli_js

test: all
	rm -rf test/*.js test/*.js.map test/*.d.ts
	npm test

test-with-docker:
	docker build  . -t $(DOCKER_IMAGE)
	docker run -v "$(PWD):/src" -t $(DOCKER_IMAGE) make test

release-dist:
	make clean
	make test \
		EMCC_OPTIMIZATION_FLAGS="$(EMCC_RELEASE_OPTIMIZATION_FLAGS)"

publish: release-dist
	@if [ -z "$(VERSION)" ] ; then echo "specify VERSION=major|minor|patch"; exit 1; fi
	npm version $(VERSION)
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
