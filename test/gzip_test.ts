import * as zlib from 'zlib';
import * as util from 'util';
import * as fs from 'fs';

import test from 'ava';
import * as zopfli from '../dist';

const gzip = util.promisify(zopfli.gzip) as any;
const gunzip = util.promisify(zlib.gunzip) as any;

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
