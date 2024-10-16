const http = require('http');
const {Command} = require("commander");
const fs = require('fs');
const path = require("node:path");

let program = new Command();

program
    .option('-h, --host <adress>', 'Input file path')
    .option('-p, --port <port>', 'Output file path')
    .option('-c, --сache <path>', 'Display result')

program.parse(process.argv);

const options = program.opts();

if (!options.host || !options.port) {
    console.error("Specify port and address correctly")
    process.exit(1);
}

const hostname = options.host; // or 'localhost'
const port = Number(options.port);

const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(body);
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
};

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET') {
         res.statusCode = 200;
         res.end("req");
    } else if (req.method === 'PUT') {
    } else if (req.method === 'DELETE') {
    } else {
        res.statusCode = 405;
        res.end(JSON.stringify({message: 'Method not allowed'}));
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});