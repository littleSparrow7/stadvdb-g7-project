
import express from 'express';
import exphbs from 'express-handlebars';
import { router } from './routes/routes.js';
import { test } from './tests/test.js';
import path from 'path';
import {fileURLToPath} from 'url';
import { CronJob } from 'cron';
import { syncMovies, verifyRecordIntegrity } from './controllers/nodeController.js';
import { NODE, checkUpdating } from './public/js/user.js';
import 'dotenv/config';

const app = express();
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


var hbs = exphbs.create({
    extname: ".hbs",
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
});

app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);

app.use(express.static('public'))
app.use('/js', express.static('public/js'));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use('/', router);
app.use('/test', test);

app.get('/', (req, res) => (
    res.render('main', {layout: 'index', label:"Home"})
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

app.get('/searchResults', (req, res) => (
    res.render('searchResults', {layout: 'index'})
));

app.listen(port, hostname, () => console.log(`Server running at: http://${hostname}:${port}`));

// sync movies every 30 minutes
// TODO: cronJob
var job = new CronJob('00 */30  * * * *', function(){
    console.log("SYNCING FILES");
    if (!checkUpdating()){
        verifyRecordIntegrity(NODE, function(status){
            syncMovies(function(){
        
            });
        });
    }
});
job.start();