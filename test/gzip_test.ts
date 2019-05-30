import zlib from 'zlib';
import util from 'util';
import fs from 'fs';
import base64 from 'base64-js'

import test from 'ava';
import { gzipAsync as gzip, deflateAsync, zlibAsync } from '../dist';

const gunzip = util.promisify<zlib.InputType, Uint8Array>(zlib.gunzip);

test('gzip, compared with `zopfli --gzip`', async (t) => {
  const s = "foo";
  const gz = await gzip(s, {});
  t.deepEqual(gz, base64.toByteArray("H4sIAAAAAAACA0vLzwcAIWVzjAMAAAA="));
});

test('zlib, compared with `zopfli --zlib`', async (t) => {
  const s = "foo";
  const zlib = await zlibAsync(s, {});
  t.deepEqual(zlib, base64.toByteArray("eNpLy88HAAKCAUU="));
});

test('deflte, compared wit `zopfli --deflate`', async (t) => {
  const s = "foo";
  const deflate = await deflateAsync(s, {});
  t.deepEqual(deflate, base64.toByteArray("S8vPBwA="));
});

test('gzip, compared wit `zopfli --zlib`', async (t) => {
  const s = "foo";
  const gz = await gzip(s, {});
  // the data is creted by `zopfli --gzip`
  t.deepEqual(gz, base64.toByteArray("H4sIAAAAAAACA0vLzwcAIWVzjAMAAAA="));
});

test('short string', async (t) => {
  const s = "foo";
  const gz = await gzip(s, {});
  const result = (await gunzip(gz)).toString();
  t.is(result, s);
});

test('string with emojis', async (t) => {
  const s = "Hello, 👪👪👪!";
  const gz = await gzip(s, {});
  const result = (await gunzip(gz)).toString();
  t.is(result, s);
});

test('large string', async (t) => {
  const s = (await util.promisify(fs.readFile)("README.md")).toString();
  const gz = await gzip(s, {});
  const result = (await gunzip(gz)).toString();
  t.is(result, s);
});

test('nodejs Buffer', async (t) => {
  const s = "foo";
  const gz = await gzip(Buffer.from(s), {});
  const result = (await gunzip(gz)).toString();
  t.is(result, s);
});

test('Uint8Array', async (t) => {
  const s = "foo";
  const gz = await gzip(new Uint8Array(Buffer.from(s)), {});
  const result = (await gunzip(gz)).toString();
  t.is(result, s);
});
