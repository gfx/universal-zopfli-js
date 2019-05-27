# Universal Zopfli [![Build Status](https://travis-ci.org/gfx/universal-zopfli-js.svg?branch=master)](https://travis-ci.org/gfx/universal-zopfli-js)

[google/zopfli](https://github.com/google/zopfli) is a compression library to perform
gzip, deflate or zlib compression.

This library is a JavaScript binding to zopfli with WebAssembly. This is slower than native extensions for zopfli, but because wasm is a portable binary format, its installation is much easier than native extensions.

## Installation

```shell-session
# for npm users:
npm install "@gfx/zopfli"

# for yarnpkg users
yarnpkg add "@gfx/zopfli"
```

## Usage

In TypeScript:

```typescript
import { gzip, zlib, deflate } from "@gfx/zopfli";

const input: string;
gzip(input, { numiterations: 15 }, (err, output) => {
    // output is compressed in gzip
});
```

Note that the `gzip` method is compatible with [node-zopfli](https://github.com/pierreinglebert/node-zopfli).

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

### Using Zopfli with promises for async/await

There are "async"-suffixed versions that returns promises:

```typescript
// These functions return `Promise<T>` for async/await.
import { gzipAsync, zlibAsync, deflateAsync } from "@gfx/zopfli";
```

### Using Zopfli in Webpack CompressionPlugin

You can give the `zopfli.gzip` function to [CompressionPlugin](https://github.com/webpack-contrib/compression-webpack-plugin):

```js
// in webpack.config.js

const CompressionPlugin = require('compression-webpack-plugin');
const { gzip } = require('@gfx/zopfli');

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: gzip,
    }),
  ],
};
```

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

As of emscripten 1.38.31 + NodeJS v10.15.3 + macOS 10.14.4, the result is as follows:

```
## payload size: 1
universal-zopfli x 203 ops/sec ±0.78% (82 runs sampled)
node-zopfli x 197 ops/sec ±7.45% (80 runs sampled)
Fastest is universal-zopfli
## payload size: 1024
universal-zopfli x 1.66 ops/sec ±14.36% (13 runs sampled)
node-zopfli x 4.82 ops/sec ±2.69% (28 runs sampled)
Fastest is node-zopfli
## payload size: 1038336
universal-zopfli x 0.30 ops/sec ±8.02% (6 runs sampled)
node-zopfli x 0.40 ops/sec ±7.11% (6 runs sampled)
Fastest is node-zopfli
```

That is, the performance of universal-zopfli is about 50%-75% of native binding node-zopfli with 1KiB-1MiB payload.

## See Also

* https://github.com/imaya/zopfli.js - The pioneer to build Zopfli with emscripten.
* https://github.com/pierreinglebert/node-zopfli - A Zopfli binding to JavaScript as NodeJS C/C++ extensions. Faster but not universal.
* https://dev.to/gfx/using-webassembly-for-a-nodejs-native-addon-dpf - my blog post that introduces this repo

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

And it links to [google/zopfli](https://github.com/google/zopfli) statically,
which is also licensed by Google under Apache 2.0 License.
