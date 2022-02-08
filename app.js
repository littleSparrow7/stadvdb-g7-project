const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const port = 8000;
const hostname = "localhost";

const router = require('./routes/test.js');

var hbs = exphbs.create({
    extname: ".hbs",
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
});

app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);

app.use(express.static('public'));
app.use(router);

app.get('/', (req, res) => (
    res.render('main', {layout: 'index'})
));

app.get('/addRecord', (req, res) => (
    res.render('addRecord', {layout: 'index', label: 'Add'})
));

app.get('/deleteRecord', (req, res) => (
    res.render('deleteRecord', {layout: 'index', label: 'Delete'})
));

app.get('/updateRecord', (req, res) => (
    res.render('updateRecord', {layout: 'index', label: 'Update'})
));

app.get('/searchRecord', (req, res) => (
    res.render('searchRecord', {layout: 'index', label: 'Search'})
));

app.listen(port, hostname, () => console.log(`Server running at: http://${hostname}:${port}`));
