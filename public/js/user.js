const express = require("express");
const router = express.Router();

var NODE = 1;
var nodepath = '/node' + NODE;
var ISOLATION_LEVEL = 'SERIALIZABLE';

//TODO: insert movie
/**
 * Inserts new movie to the database
 * @param {Movie} movie movie without id
 */
exports.insertMovie = function(movie){
    console.log("INSERT MOVIE");
    router.route(nodepath + "/insertMovie").post(function(req, res, next){
        res.send(res);
    });
}

//TODO: update movie
/**
 * Updates movie based on the id number
 * @param {Movie} movie updated movie
 */
exports.updateMovie = function(movie){
    switch(NODE){
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
            break;
    }
}

//TODO: delete movie
/**
 * Deletes movie from the database based on id number
 * @param {number} id id of movie to be deleted
 */
exports.deleteMovie = function(id){
    switch(NODE){
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
            break;
    }
}

//TODO: search movie
/**
 * Searches for movie in the database based on the corresponding information.
 * Null values are ignored in the search process.
 * @param {Movie} movie partially filled movie object
 */
exports.searchMovie = function(movie){
    switch(NODE){
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
            break;
    }
}