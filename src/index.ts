/**
    Copyright 2017, FUJI Goro (gfx).

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

enum ZopfliFormat {
  GZIP,
  ZLIB,
  DEFLATE,
}

// https://github.com/google/zopfli/blob/master/src/zopfli/zopfli.h
export interface ZopfliOptions {
  /** Whether to print output */
  verbose?: boolean;

  /** Whether to print more detailed output  */
  verbose_more?: boolean;
  /**
      Maximum amount of times to rerun forward and backward pass to optimize LZ77
      compression cost. Good values: 10, 15 for small files, 5 for files over
      several MB in size or it will be too slow.
   */
  numiterations?: number;
  /**
      If true, splits the data in multiple deflate blocks with optimal choice
      for the block boundaries. Block splitting gives better compression. Default:
      true (1).
   */
  blocksplitting?: boolean;

  /**
      Maximum amount of blocks to split into (0 for unlimited, but this can give
      extreme results that hurt compression on some files). Default value: 15.
   */
  blocksplittingmax?: number;
}

const defaultOptions: ZopfliOptions = {
  verbose: false,
  verbose_more: false,
  numiterations: 15,
  blocksplitting: true,
  blocksplittingmax: 15,
};

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

function ensureByteBuffer(input: InputType): Array<number> | Uint8Array {
  if (typeof input === 'string') {
    const a = z.intArrayFromString(input);
    a.length--; // because emscripten's intArrayFromString() adds trailing nul
    return a;
  } else {
    return input;
  }
}

function callCompress(input: InputType, format: ZopfliFormat, options: ZopfliOptions, cb: OnCompressComplete) {
  console.assert(input != null, "buffer must not be null");
  console.assert(options != null, "options must not be null");
  console.assert(cb != null, "cb must not be null");

  const byteBuffer = ensureByteBuffer(input);
  const bufferPtr = z.allocate(byteBuffer, 'i8', z.ALLOC_NORMAL);

  const opts = { ...defaultOptions, ...options };

  const output = z._createZopfliJsOutput();
  z._compress(bufferPtr, byteBuffer.length, output,
    format,
    opts.verbose,
    opts.verbose_more,
    opts.numiterations,
    opts.blocksplitting,
    opts.blocksplittingmax,
  );

  const outputPtr = z._getBuffer(output);
  const outputSize = z._getBufferSize(output);

  const result = new Uint8Array(z.HEAP8.subarray(outputPtr, outputPtr + outputSize));
  z._deallocate(outputPtr);
  z._deallocate(output);
  z._deallocate(bufferPtr);

  // zopfli does not fail unless a violation of preconditions occurs.
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

function promisify(f: (buffer: InputType, options: ZopfliOptions, cb: OnCompressComplete) => void) {
  return (buffer: InputType, options: ZopfliOptions) => {
    return new Promise<Uint8Array>((resolve, reject) => {
      f(buffer, options, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

export const gzipAsync = promisify(gzip);
export const zlibAsync = promisify(zlib);
export const deflateAsync = promisify(deflate);
