const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const port = 8000;
const hostname = "localhost";

// const routes = require('./routes/');

var hbs = exphbs.create({
    extname: ".hbs",
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
});

app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);

app.use(express.static('public'));

app.get('/', (req, res) => (
    res.render('main', {layout: 'index'})
));

app.listen(port, hostname, () => console.log(`Server running at: http://${hostname}:${port}`));
