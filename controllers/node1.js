import { node1, node2, node3, getConnections } from './pools.js';
import * as sql from "./nodes.js";
import Movie from '../public/js/movie.js';
import { uncommittedMovies } from '../public/js/user.js';

export function addMovie(req, res){
    //set other node to write to
    var backupNode = (req.body.year < 1980)? node2 : node3;
    //movie to be inserted
    var movie = new Movie(null, req.body.title, req.body.year, req.body.rating, req.body.nsynced, req.body.deleted);
    // console.log(movie);
    
    getConnections(node1, backupNode, function(conn1, conn2){
        if (conn1 != null){
            //lock necessary tables
            sql.lockTablesWrite(conn1, conn2, function(lockStatus){
                if (lockStatus.conn1 == 200){
                    //if successfully locked node1, insert
                    sql.insertMovie(conn1, movie, function(id, insert1Status){
                        if (insert1Status == 200){
                            if (lockStatus.conn2 == 200){
                                //if lock 2 also successful, add to 2
                                movie.id = id;

                                //insert movie to other node
                                sql.insertMovie(conn2, movie, function(id, insert2Status){
                                    //regardless of whether node2 was successful, node1 must be successful in committing
                                    sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                        if (commit1Status.commit == 200){
                                            //if node1 successfully committed, commit node2
                                            if (insert2Status == 200){
                                                sql.commitOrRollBackTransaction(conn2, function(commit2Status){
                                                    sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                        res.send(unlockStatus);
                                                    });
                                                });
                                            }
                                            else{
                                                sql.rollbackTransaction(conn2, function(rollback2Status){
                                                    sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                        res.send(unlockStatus);
                                                    });
                                                });
                                            }
                                        }
                                        else {
                                            //if node1 is unsuccessful
                                            uncommittedMovies.push(movie);

                                            // node 2 was locked, always rollback because node1 failed
                                            sql.rollbackTransaction(conn2, function(rollback2Status){
                                                sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                    res.send(unlockStatus);
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                            else{
                                //if lock 2 not succesful, end transaction
                                //if end transaction successful, unlock
                                //if end transaction unsuccessful, add to local list, rollback then unlock
                                sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                    if (commit1Status.commit != 200){
                                        uncommittedMovies.push(movie);
                                    }

                                    sql.unlockTable(conn1, function(unlock1Status){
                                        res.send({commit: commit1Status.commit, unlock: unlock1Status});
                                    });
                                });
                            }
                        }
                        else{
                            // if failed to add, add to list, 
                            uncommittedMovies.push(movie);

                            //rollback transaction 1
                            sql.rollbackTransaction(conn1, function(rollback1Status){
                                if (lockStatus.pool2 == 200){
                                    //unlock 2 also if it was locked earlier
                                    sql.unlockTables(conn1, conn2, function(unlockStatus){
                                        res.send(unlockStatus);
                                    });
                                }
                                else{
                                    //only unlock 1
                                    sql.unlockTables(conn1, function(unlockStatus){
                                        res.send(unlockStatus);
                                    })
                                }
                            });
                        }
                    });
                }
                else{
                    //if failed to lock node1, add to local list.
                    //let syncing function handle it later.
                    uncommittedMovies.push(movie);
                    res.sendStatus(lockStatus);
                }
            });
        }
        else{
            console.error("FAILED TO CONNECT TO THE DATABASES");
        }
    });
    
    
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