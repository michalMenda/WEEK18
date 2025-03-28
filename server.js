const http = require('http');
const fs = require('fs').promises;
const url = require('url');


// פונקציה לטעינה מקובץ
async function loadContacts(fileName) {
    try {
        const data = await fs.readFile(fileName, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('שגיאה בקריאת קובץ אנשי קשר:', error);
        return [];
    }
}
// בדיקה האם המספר הוא ראשוני
function isPrime(num) {
    const sqrt = Math.sqrt(num);
    for (let i = 2; i <= sqrt; i++) {
        if (num % i === 0) return false;
    }
    return num > 1;
}
// מספרים ראשוניים
function getPrimes(n) {
    const primes = [];
    let num = 2;
    
    while (primes.length < n) {
        if (isPrime(num)) primes.push(num);
        num++;
    }
    return primes;
}
// חישוב עצרת
function getFactorial(n) {
    return n <= 1 ? 1 : n * getFactorial(n - 1);
}

// יצירת שרת 
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    try {
        switch (true) {
            case path === '/': {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                const htmlContent = await fs.readFile('./main.html', 'utf8');
                return res.end(htmlContent);
            }
            case path === '/pages': {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                return res.end('<h2>Pages</h2><a href="/pages/about">About</a><br><a href="/pages/sports">Sports</a>');
            }
            case path.startsWith('/pages/'): {
                const page = path.split('/')[2];
                const filePath = `pages/${page}.html`;
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    return res.end(content);
                } catch {
                    res.writeHead(404);
                    return res.end('Page not found');
                }
            }
            case path === '/files': {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                return res.end('<h2>Available files: people, shops</h2><a href="/files/people">People</a><br> <a href="/files/shops">Shops</a>');
            }
            case path.startsWith('/files/'): {
                const file = path.split('/')[2];
                const filePath = `files/${file}.txt`;
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    return res.end(content);
                } catch {
                    res.writeHead(404);
                    return res.end('File not found');
                }
            }
            case path === '/contacts': {
                const contacts = await loadContacts('contacts.json');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(contacts));
            }
            case path.startsWith('/contacts/'): {
                const id = parseInt(path.split('/')[2]);
                const contacts = await loadContacts('contacts.json');
                const contact = contacts.find(c => c.id === id);
                res.writeHead(contact ? 200 : 404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(contact || { error: 'Contact not found' }));
            }
            case path.startsWith('/comps/primes/'): {
                const n = parseInt(path.split('/')[3]);
                if (isNaN(n)) return res.end('Invalid number');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(getPrimes(n)));
            }
            case path.startsWith('/comps/factorial/'): {
                const n = parseInt(path.split('/')[3]);
                if (isNaN(n)) return res.end('Invalid number');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ factorial: getFactorial(n) }));
            }
            default:
                res.writeHead(404);
                res.end('Not found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

server.listen(3000, () => console.log('Server running at http://localhost:3000'));