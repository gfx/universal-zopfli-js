# Universal Zopfli

[google/zopfli](https://github.com/google/zopfli) is a compression library to perform
gzip, deflate or zlib compression.

This library is a JavaScript binding to zopfli with WebAssembly. This might be slower than C/C++ extension for zopfli, but because wasm is portable binary its installation is much easier than C/C++ extensions.


## Development

### Prerequisites

* [emscripten](https://github.com/kripken/emscripten)
* NodeJS v8.0 or later
* GNU make

### Testing

```shell-session
make
```

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

