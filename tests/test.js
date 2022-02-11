import express from 'express';
export var test = express.Router();
import {node1, node2, node3} from '../controllers/pools.js';
import * as sql from '../controllers/nodes.js';
import * as node1Controller from '../controllers/node1.js';
import Movie from '../controllers/movie.js';

test.get('/test', function(req, res){
    console.log("test");
});

// router.get('/check1', function(req,res){
//     node1.query("select * from movies limit 10", function(error, result){
//         if(error){
//             res.send(error);
//         }
//         else{
//             res.send(result);
//         }
//     })
// });

// router.get('/check2', function(req,res){
//     node2.query("select * from movies limit 10", function(error, result){
//         if(error){
//             res.send(error);
//         }
//         else{
//             res.send(result);
//         }
//     })
// });

// router.get('/check3', function(req,res){
//     node3.query("select * from movies limit 10", function(error, result){
//         if(error){
//             res.send(error);
//         }
//         else{
//             res.send(result);
//         }
//     })
// });

test.get('/add1', function (req,res){
    var movie = new Movie(null, "Title", 1984, null, 1, 0);
    sql.insertMovie(node1, movie, function(result){
        res.send(result);
    });
});

test.get('/add1Node', function (req,res){
    var movie = {
        title: "Title",
        year: 1973,
        rank: null,
        nsynced: 0,
        deleted: 0
    };
    node1Controller.addMovie(movie, res);
    // sql.insertMovie(node1, movie, function(result){
    //     res.send(result);
    // });
});