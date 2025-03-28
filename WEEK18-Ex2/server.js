const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// מידלוור
app.use(express.json());
app.use(express.static('public'));

// פונקציה לטעינה מקובץ
async function loadContacts(fileName) {
    try {
        const data = await fs.readFile(fileName, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading contacts file:', error);
        return [];
    }
}
// בדיקה האם מספר הוא ראשוני
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


app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// עמודים
app.get('/pages', (req, res) => {
    res.send('<h2>Pages</h2><a href="/pages/about">About</a><br><a href="/pages/sports">Sports</a>');
});

app.get('/pages/:page', async (req, res) => {
    const filePath = path.join(__dirname, 'pages', `${req.params.page}.html`);
    try {
        const content = await fs.readFile(filePath, 'utf8');
        res.send(content);
    } catch {
        res.status(404).send('Page not found');
    }
});

// קבצים
app.get('/files', (req, res) => {
    res.send('<h2>Available files: people, shops</h2><a href="/files/people">People</a><br> <a href="/files/shops">Shops</a>');
});

app.get('/files/:file', async (req, res) => {
    const filePath = path.join(__dirname, 'files', `${req.params.file}.txt`);
    try {
        const content = await fs.readFile(filePath, 'utf8');
        res.type('text/plain').send(content);
    } catch {
        res.status(404).send('File not found');
    }
});

// אנשי קשר
app.get('/contacts', async (req, res) => {
    const contacts = await loadContacts('contacts.json');
    res.json(contacts);
});

app.get('/contacts/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const contacts = await loadContacts('contacts.json');
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        res.json(contact);
    } else {
        res.status(404).json({ error: 'Contact not found' });
    }
});

// חישוב מספרים ראשוניים
app.get('/comps/primes/:n', (req, res) => {
    const n = parseInt(req.params.n);
    if (isNaN(n)) return res.status(400).send('Invalid number');
    res.json(getPrimes(n));
});

// חישוב עצרת
app.get('/comps/factorial/:n', (req, res) => {
    const n = parseInt(req.params.n);
    if (isNaN(n)) return res.status(400).send('Invalid number');
    res.json({ factorial: getFactorial(n) });
});

app.listen(3000, () => console.log(`Server running at http://localhost:3000`));
