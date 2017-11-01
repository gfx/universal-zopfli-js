const base64 = require('base64-js');
const wasm64 = require('./libzopfli-wasm');


// The emscripten's Module object.
// See http://kripken.github.io/emscripten-site/docs/api_reference/module.html for details.
var Module = {};

Module.noInitialRun = true;
Module.wasmBinary = base64.toByteArray(wasm64);
