const {node1, node2, node3} = require('./pools.js');
const nodes = require("./nodes.js");

exports.addMovie = function(req, res){
    // nodes.utils().insertMovie(node1, movie);
    
    //if year > 1980, insert to...
    //else, insert to...
    //unlock
    //sync
    res.send("ADD MOVIE");
}

exports.updateMovie = function(req, res){
    //update
    //if year > 1980, update...
    //else, update...
    //unlock
    //sync
    res.send("UPDATE MOVIE");
}

exports.deleteMovie = function(req, res){
    //delete
    //if year > 1980, delete...
    //else, delete...
    //unlock
    //sync
    res.send("DELETE MOVIE")
}