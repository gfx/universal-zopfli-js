/**
    Copyright 2017, FUJI Goro ([gfx](https://github.com/gfx)).

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

#include <stdlib.h>
#include <assert.h>
#include <stdbool.h>

#include "emscripten/emscripten.h"
#include "zopfli.h"

typedef struct
{
    unsigned char *buffer;
    size_t bufferSize;
} ZopfliJsOutput;

EMSCRIPTEN_KEEPALIVE
ZopfliFormat formatGzip()
{
    return ZOPFLI_FORMAT_GZIP;
}

EMSCRIPTEN_KEEPALIVE
ZopfliFormat formatZlib()
{
    return ZOPFLI_FORMAT_ZLIB;
}

EMSCRIPTEN_KEEPALIVE
ZopfliFormat formatDeflate()
{
    return ZOPFLI_FORMAT_DEFLATE;
}

EMSCRIPTEN_KEEPALIVE
ZopfliJsOutput *createZopfliJsOutput()
{
    return (ZopfliJsOutput *)calloc(1, sizeof(ZopfliJsOutput));
}

EMSCRIPTEN_KEEPALIVE
unsigned char *getBuffer(ZopfliJsOutput *output)
{
    return output->buffer;
}

EMSCRIPTEN_KEEPALIVE
size_t getBufferSize(ZopfliJsOutput *output)
{
    return output->bufferSize;
}

EMSCRIPTEN_KEEPALIVE
void compress(const unsigned char *buffer,
              size_t bufferSize,
              ZopfliJsOutput *output,
              ZopfliFormat zopfliFormat,
              bool verbose,
              bool verbose_more,
              int numiterations,
              bool blocksplitting,
              bool blocksplittinglast,
              int blocksplittingmax
)
{
    assert(buffer != NULL);
    assert(output != NULL);

    ZopfliOptions options;
    ZopfliInitOptions(&options);

    options.verbose = verbose;
    options.verbose_more = verbose_more;
    options.numiterations = numiterations;
    options.blocksplitting = blocksplitting;
    options.blocksplittinglast = blocksplittinglast;
    options.blocksplittingmax = blocksplittingmax;

    ZopfliCompress(&options,
                   zopfliFormat,
                   buffer, bufferSize,
                   &output->buffer, &output->bufferSize);
}
