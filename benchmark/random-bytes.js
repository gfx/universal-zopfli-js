'use strict';

const crypto = require('crypto');
const Benchmark = require('benchmark');
const util = require('util');

const universalZopfli = require('../dist');
const nodeZopfli = require('node-zopfli');

(async () => {
  // warmup
  await util.promisify(universalZopfli.gzip)(crypto.randomBytes(1024 * 1024), {});
  await util.promisify(nodeZopfli.gzip)(crypto.randomBytes(1024 * 1024), {});

  // run
  for (const size of [1, 1024, 1024 * 1014]) {
    await new Promise((resolve) => {
      const randomBytes = crypto.randomBytes(size);
      console.log(`## payload size: ${size}`);

      const suite = new Benchmark.Suite();

      suite
        .add('universal-zopfli', {
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
          resolve();
        })
        .run({ async: true });
    });
  }
})();
