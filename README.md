# Universal Zopfli [![Build Status](https://travis-ci.org/gfx/universal-zopfli-js.svg?branch=master)](https://travis-ci.org/gfx/universal-zopfli-js)

[google/zopfli](https://github.com/google/zopfli) is a compression library to perform
gzip, deflate or zlib compression.

This library is a JavaScript binding to zopfli with WebAssembly. This might be slower than C/C++ extension for zopfli, but because wasm is portable binary its installation is much easier than C/C++ extensions.

## Usage

```typescript
import { gzip } from "@gfx/zopfli";

const input: string;
gzip(input, { numiterations: 15 }, (err, output) => {
    // output is compressed in gzip
});
```

### Options

Exported as `ZopfliOptions` and its default is:

```typescript
const defaultOptions: ZopfliOptions = {
    verbose: false,
    verbose_more: false,
    numiterations: 15,
    blocksplitting: true,
    blocksplittingmax: 15,
};
```

See

## Development

### Prerequisites

* [emscripten](https://github.com/kripken/emscripten)
* NodeJS v8.0 or later
* GNU make

### Testing

```shell-session
make
```

### Benchmarking

```shell-session
make benchmark-with-optimization
```

As of emscripten 1.37.22 + NodeJS 8.9.1 + macOS 10.12.6, the result is as follows:

```
## payload size: 1
universal-zopfli x 1,415 ops/sec ±6.41% (73 runs sampled)
node-zopfli x 168 ops/sec ±7.12% (70 runs sampled)
Fastest is universal-zopfli
## payload size: 1024
universal-zopfli x 1.46 ops/sec ±10.12% (12 runs sampled)
node-zopfli x 4.69 ops/sec ±3.34% (27 runs sampled)
Fastest is node-zopfli
## payload size: 1038336
universal-zopfli x 0.26 ops/sec ±2.27% (6 runs sampled)
node-zopfli x 0.35 ops/sec ±14.22% (6 runs sampled)
Fastest is node-zopfli
```

That is, the performance of universal-zopfli is about 70% of native binding node-zopfli with 1MB payload.

## See Also

* https://github.com/imaya/zopfli.js - The pioneer to build zopfli with emscripten

## Copyright

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

