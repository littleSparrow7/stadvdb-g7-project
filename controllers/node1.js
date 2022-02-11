import { node1, node2, node3 } from './pools.js';
import * as sql from "./nodes.js";
import Movie from './movie.js';

export function addMovie(req, res){
    //set other node to write to
    var backupNode = (req.year < 1980)? node2 : node3;
    //movie to be inserted
    var movie = new Movie(null, req.title, req.year, req.rating, req.nsynced, req.deleted);

    //lock necessary tables
    sql.lockTablesWrite(node1, backupNode, function(lockStatus){
        if (lockStatus == 200){
            //insert to first node
            sql.insertMovie(node1, movie, function(id, insert1Status){
                if (insert1Status == 200){
                    movie.id = id; //get id as last inserted

                    //insert to other node
                    sql.insertMovie(backupNode, movie, function(id2, insert2Status){
                        if (insert2Status == 200){
                            sql.unlockTables(backupNode, node1, function(unlockStatus){
                                res.sendStatus(unlockStatus);
                            });
                        }
                        else{
                            //change nsynced of first node
                            movie.nsynced = 1;
                            //TODO: update nsynced of movie in first table
                            //TODO: unlock tables
                            res.sendStatus(insert2Status);
                        }
                    });
                }
                else{
                    //since, have locks to both tables, no deadlocks
                    //if it fails, don't try to add. can't do anything since master node is gone and no local db.
                    sql.unlockTables(backupNode, node1, function(unlockStatus){
                        res.sendStatus(insert1Status);
                    });
                }
            });
        }
        else{
            //if failed, add to node1 and update in others later
            movie.nsynced = 1;
            sql.insertMovie(node1, movie, function(id, insertStatus){
                if (insertStatus == 200){
                    sql.unlockTable(node1, function(unlockStatus){
                        res.sendStatus(unlockStatus);
                    });
                }
                else {
                    //send status of why insert failed
                    sql.unlockTable(node1, function(unlockStatus){
                        res.sendStatus(insert1Status);
                    });
                }
            });
        }
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