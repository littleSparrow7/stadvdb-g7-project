var express = require('express');
var router = express.Router();
const {node1, node2, node3} = require('./pools.js');

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

module.exports = router;