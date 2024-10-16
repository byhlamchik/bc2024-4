const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');
const { Command } = require('commander');

// Ініціалізація командера для обробки параметрів командного рядка
const program = new Command();
program
    .requiredOption('-h, --host <host>', 'Host for the server')
    .requiredOption('-p, --port <port>', 'Port for the server')
    .requiredOption('-c, --cache <cache>', 'Path to the cache directory');

program.parse(process.argv);
const options = program.opts();

// Перевірка параметрів
if (!options.host || !options.port || !options.cache) {
    console.error('Missing required options');
    process.exit(1);
}

// Створюємо сервер
const server = http.createServer(async (req, res) => {
    const filePath = `${options.cache+req.url}.jpg`

    if (req.method === 'GET') {
        try {
            // Перевіряємо, чи є файл у кеші
            const data = await fs.readFile(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/jpeg');
            res.end(data);
        } catch (err) {
            // Якщо файл не знайдено в кеші, запитуємо з http.cat
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
        // Обробка PUT запиту для збереження зображення у кеш
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
        // Обробка DELETE запиту для видалення зображення з кешу
        try {
            await fs.unlink(filePath);
            res.statusCode = 200;
            res.end('Image deleted\n');
        } catch (err) {
            res.statusCode = 404;
            res.end('Image not found\n');
        }
    } else {
        // Відповідь на запити з іншими методами
        res.statusCode = 405;
        res.end('Method not allowed\n');
    }
});

// Запуск сервера
server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});
