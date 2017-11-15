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


const z = require("./libzopfli");

export enum ZopfliFormat {
    GZIP,
    ZLIB,
    DEFLATE,
}

export interface ZopfliOptions {
    numIterations: number;
}

export type OnCompressComplete = (err: Error | null, buffer: Uint8Array) => void;

export type InputType = Uint8Array | Array<number> | string;

type Task = () => void;

let queue: Array<Task> | null = new Array<Task>();

z.onRuntimeInitialized = () => {
    for (const task of queue!) {
        task();
    }
    queue = null;
};

function callCompress(buffer: InputType, format: ZopfliFormat, options: ZopfliOptions, cb: OnCompressComplete) {
    const byteBuffer = typeof buffer === 'string' ? z.intArrayFromString(buffer) : buffer;
    const bufferPtr = z.allocate(byteBuffer, 'i8', z.ALLOC_NORMAL);

    const output = z._createZopfliJsOutput();
    z._compress(bufferPtr, byteBuffer.length - 1 /* nul */, output, options.numIterations, format);

    const outputPtr = z._getBuffer(output);
    const outputSize = z._getBufferSize(output);

    const result = new Uint8Array(z.HEAP8.subarray(outputPtr, outputPtr + outputSize));
    z._free(outputPtr);
    z._free(output);
    z._free(bufferPtr);
    cb(null, result);
}

function compress(buffer: InputType, format: ZopfliFormat, options: ZopfliOptions, cb: OnCompressComplete) {
    if (queue) {
        queue.push(() => {
            callCompress(buffer, format, options, cb);
        });
    } else {
        callCompress(buffer, format, options, cb);
    }
}

export function gzip(buffer: InputType, options: ZopfliOptions, cb: OnCompressComplete) {
    compress(buffer, ZopfliFormat.GZIP, options, cb);
}

export function zlib(buffer: InputType, options: ZopfliOptions, cb: OnCompressComplete) {
    compress(buffer, ZopfliFormat.ZLIB, options, cb);
}

export function deflate(buffer: InputType, options: ZopfliOptions, cb: OnCompressComplete) {
    compress(buffer, ZopfliFormat.DEFLATE, options, cb);
}
