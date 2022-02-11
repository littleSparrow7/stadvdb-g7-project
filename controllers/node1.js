import { node1, node2, node3 } from './pools.js';
import * as sql from "./nodes.js";
import Movie from './movie.js';

export function addMovie(req, res){
    sql.lockTableWrite(node1, function(){
        var backupNode = null;

        if (req.year < 1980)
            backupNode = node2;
        else
            backupNode = node3;
        
        sql.lockTableWrite(backupNode, function(){
            var movie = new Movie(null, req.title, req.year, req.rating, req.nsynced, req.deleted);
            sql.insertMovie(node1, movie, function(id){
                movie.id = id;
                sql.insertMovie(backupNode, movie, function(id){
                    sql.unlockTables(backupNode, function(){
                        sql.unlockTables(node1, function(){
                            res.sendStatus(200);
                        });
                    });
                });
            });
        });
    });
    
    
    //if year < 1980, insert to node 2
    //else, insert to node 3
    //check nsynced from other nodes
    //check nsynced from current node
    // res.send("ADD MOVIE");
}

export function updateMovie(req, res){
    //update
    //if year < 1980, update node 2
    //else, update node 3
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("UPDATE MOVIE");
}

export function deleteMovie(req, res){
    //delete
    //if year < 1980, delete from node 2
    //else, delete from node 3
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("DELETE MOVIE")
}

export function searchMovie(req, res){
    //search node 1, node 2, and node 3
    res.send("SEARCH MOVIE")
}