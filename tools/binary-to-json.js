#!/usr/bin/env node

const fs = require('fs');
const base64 = require('base64-js');

const [_node, _self, binaryFile] = process.argv;

if (!binaryFile) {
  console.error("No input file given.");
  process.exit(1);
}

fs.readFile(binaryFile, (err, buffer) => {
  const json = JSON.stringify(base64.fromByteArray(buffer)) + "\n";
  process.stdout.write(json, (err) => {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
});
