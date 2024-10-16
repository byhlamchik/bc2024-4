const {Command} = require("commander");
const fs = require('fs');
const path = require("node:path");

let program = new Command();

program
    .option('-i, --input <string>', 'Input file path')
    .option('-o, --output <string>', 'Output file path')
    .option('-d, --display', 'Display result')
    .option('-b, --debug', 'Show debug info');

program.parse(process.argv);

const options = program.opts();