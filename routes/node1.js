const {node1, node2, node3} = require('./pools.js');
const nodes = require("./nodes.js");

exports.utils = function(){
    return {
        addMovie: function(movie){
            nodes.utils().insertMovie(node1, movie);
            
            //if year > 1980, insert to...
            //else, insert to...
            //unlock
            //sync
        },
        updateMovie: function(arr){
            if (!locked){
                locked = true;
                //update
                //if year > 1980, update...
                //else, update...
                //unlock
                //sync
            }
        },
        deleteMovie: function(arr){
            if (!locked){
                locked = true;
                //delete
                //if year > 1980, delete...
                //else, delete...
                //unlock
                //sync
            }
        }
    }
};