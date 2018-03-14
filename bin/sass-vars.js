#!/usr/bin/env node

const declareModule = require('../dist').declareModule;
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

let [, , file, destFile] = process.argv;

file = file && path.resolve(
  process.cwd(),
  file
);

if (!fs.existsSync(file)) {
  console.error(chalk.red`First argument must be a .scss file path`);
  process.exit(1);
}

if (!destFile) {
  destFile = path.resolve(
    path.dirname(file),
    `${path.basename(file)}.d.ts`,
  );
}

declareModule(file, {
  camelCase: true,
  destFile,
});

console.info(chalk`SASS variable module generated for {yellow ${file}} in {yellow ${destFile}}`);
