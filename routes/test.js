var express = require('express');
var router = express.Router();
const {node1, node2, node3} = require('./pools.js');
const n1 = require('./node1.js');
const Movie = require('./movie.js');

router.get('/test', function(req, res){
    console.log("test");
});

router.get('/check1', function(req,res){
    node1.query("select * from movies limit 10", function(error, result){
        if(error){
            res.send(error);
        }
        else{
            res.send(result);
        }
    })
});

router.get('/check2', function(req,res){
    node2.query("select * from movies limit 10", function(error, result){
        if(error){
            res.send(error);
        }
        else{
            res.send(result);
        }
    })
});

router.get('/check3', function(req,res){
    node3.query("select * from movies limit 10", function(error, result){
        if(error){
            res.send(error);
        }
        else{
            res.send(result);
        }
    })
});

router.get('/add1', function (req,res){
    // var movie = new Movie(null, "Title", 1984, null, 1);
    // console.log(movie.valuesString);
    // n1.utils().addMovie(movie);
});

module.exports = router;