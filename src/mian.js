const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');
const { Command } = require('commander');

const program = new Command();
program
    .requiredOption('-h, --host <host>', 'Host for the server')
    .requiredOption('-p, --port <port>', 'Port for the server')
    .requiredOption('-c, --cache <cache>', 'Path to the cache directory');

program.parse(process.argv);
const options = program.opts();

if (!options.host || !options.port || !options.cache) {
    console.error('Missing required options');
    process.exit(1);
}

// Створюємо сервер
const server = http.createServer(async (req, res) => {
    const filePath = `${options.cache+req.url}.jpg`

    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/jpeg');
            res.end(data);
        } catch (err) {
            try {
                try {
                    await fs.mkdir(options.cache)
                } catch (e) {}
                const catResponse = await superagent.get(`https://http.cat/${req.url}`);
                await fs.writeFile(filePath, Buffer.from(catResponse.body));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'image/jpeg');
                res.end(catResponse.body);
            } catch (err) {
                res.statusCode = 404;
                res.end('Image not found\n');
            }
        }
    } else if (req.method === 'PUT') {
        try {
            let body = [];
            req.on('data', chunk => body.push(chunk));
            req.on('end', async () => {
                const buffer = Buffer.concat(body);
                await fs.writeFile(filePath, buffer);
                res.statusCode = 201;
                res.end('Image saved\n');
            });
        } catch (err) {
            res.statusCode = 500;
            res.end('Error saving image\n');
        }
    } else if (req.method === 'DELETE') {
        try {
            await fs.unlink(filePath);
            res.statusCode = 200;
            res.end('Image deleted\n');
        } catch (err) {
            res.statusCode = 404;
            res.end('Image not found\n');
        }
    } else {
        res.statusCode = 405;
        res.end('Method not allowed\n');
    }
});

server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});
