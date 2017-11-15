'use strict';

const crypto = require('crypto');
const Benchmark = require('benchmark');

const universalZopfli = require('../dist');
const nodeZopfli = require('node-zopfli');

const randomBytes = crypto.randomBytes(1 * 1024 * 1024);

const suite = new Benchmark.Suite();

suite.
  add('universal-zopfli', {
    defer: true,
    fn: (deffered) => {
      universalZopfli.gzip(randomBytes, {}, (err, result) => {
        deffered.resolve();
      });
    },
  })
  .add('node-zopfli', {
    defer: true,
    fn: (deffered) => {
      nodeZopfli.gzip(randomBytes, {}, (err, result) => {
        deffered.resolve();
      });
    },
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run({ async: true });
