#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <zopfli.h>

using namespace emscripten;

int add(int x, int y) {
    return x + y;
}

std::string compress(std::string buffer) noexcept {
    ZopfliOptions options;
    ZopfliInitOptions(&options);

    unsigned char *out = nullptr;
    std::size_t outsize = 0;

    ZopfliCompress(&options, ZOPFLI_FORMAT_GZIP,
        reinterpret_cast<const unsigned char*>(buffer.data()), buffer.size(),
        &out, &outsize);

    std::string result(reinterpret_cast<const char*>(out), outsize);

    free(out);

    return result;
}


EMSCRIPTEN_BINDINGS(zopfli_js) {
    function("compress", compress);
    function("_add", add);
}
