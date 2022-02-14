import { node1, node2, node3, getConnections } from './pools.js';
import * as sql from "./nodes.js";
import Movie from '../public/js/movie.js';
import { uncommittedMovies } from '../public/js/user.js';

export function addMovie(req, res){
    //add movie information
    var data = {
        node1: {
            connected: false,
            locked: false,
            inserted: false,
            unlocked: false
        },
        backupNode: {
            connected: false,
            locked: false,
            inserted: false,
            unlocked: false
        }
    };

    //set other node to write to
    var backupNode = (req.body.year < 1980)? node2 : node3;
    //movie to be inserted
    var movie = new Movie(null, req.body.title, req.body.year, req.body.rating, req.body.nsynced, req.body.deleted);
    // console.log(movie);
    
    getConnections(node1, backupNode, function(conn1, conn2){
        if (conn1 != null){
            data.node1.connected = true;

            //lock necessary tables
            if (conn2 != null){
                data.backupNode.connected = true;

                sql.lockTablesWrite(conn1, conn2, function(lockStatus){
                    if (lockStatus.conn1 == 200){
                        data.node1.locked = true;

                        //if successfully locked node1, insert
                        sql.insertMovie(conn1, movie, function(id, insert1Status){
                            if (insert1Status == 200){
                                if (lockStatus.conn2 == 200){
                                    //if lock 2 also successful, add to 2
                                    movie.id = id;
                                    data.backupNode.locked = true;
    
                                    //insert movie to other node
                                    sql.insertMovie(conn2, movie, function(id, insert2Status){
                                        //regardless of whether node2 was successful, node1 must be successful in committing
                                        sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                            if (commit1Status.commit == 200){
                                                data.node1.inserted = true;

                                                //if node1 successfully committed, commit node2
                                                if (insert2Status == 200){
                                                    sql.commitOrRollBackTransaction(conn2, function(commit2Status){
                                                        if (commit2Status.commit == 200)
                                                            data.backupNode.inserted = true;

                                                        sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                            if (unlockStatus.conn1 == 200)
                                                                data.node1.unlocked = true;
                                                            
                                                            if (unlockStatus.conn2 == 200)
                                                                data.backupNode.unlocked = true;

                                                            res.send(data);
                                                        });
                                                    });
                                                }
                                                else{
                                                    sql.rollbackTransaction(conn2, function(rollback2Status){
                                                        sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                            if (unlockStatus.conn1 == 200)
                                                                data.node1.unlocked = true;
                                                            
                                                            if (unlockStatus.conn2 == 200)
                                                                data.backupNode.unlocked = true;

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
                                                        if (unlockStatus.conn1 == 200)
                                                            data.node1.unlocked = true;
                                                            
                                                        if (unlockStatus.conn2 == 200)
                                                            data.backupNode.unlocked = true;

                                                        res.send(data);
                                                    });
                                                });
                                            }
                                        });
                                    });
                                }
                                else {
                                    //if lock 2 not succesful, end transaction
                                    //if end transaction successful, unlock
                                    //if end transaction unsuccessful, add to local list, rollback then unlock
                                    sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                        if (commit1Status.commit != 200){
                                            uncommittedMovies.push(movie);
                                        }
                                        else{
                                            data.node1.inserted = true;
                                        }
    
                                        sql.unlockTable(conn1, function(unlock1Status){
                                            if (unlock1Status == 200){
                                                data.node1.unlocked = true;
                                            }

                                            res.send(data);
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
                                        data.backupNode.locked = true;
                                        sql.unlockTables(conn1, conn2, function(unlockStatus){
                                            if (unlockStatus.conn1 == 200)
                                                data.node1.unlocked = true;
                                                
                                            if (unlockStatus.conn2 == 200)
                                                data.backupNode.unlocked = true;

                                            res.send(data);
                                        });
                                    }
                                    else{
                                        //only unlock 1
                                        sql.unlockTables(conn1, function(unlockStatus){
                                            if (unlockStatus.conn1 == 200)
                                                data.node1.unlocked = true;
                                            
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
                        res.send(data);
                    }
                });
            }
            else{
                //if failed to connect to node2, add to node1 anyway
                sql.lockTableWrite(conn1, function(lockStatus){
                    if (lockStatus == 200){
                        data.node1.locked = true;

                        sql.insertMovie(conn1, movie, function(id, insert1Status){
                            if (insert1Status == 200){
                                sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                    if(commit1Status.commit == 200){
                                        data.node1.inserted = true;
                                    }
                                    else{
                                        uncommittedMovies.push(movie);
                                    }

                                    sql.unlockTable(conn1, function(unlockStatus){
                                        if (unlockStatus == 200)
                                            data.node1.unlocked = true;
                                        res.send(data);
                                    })
                                });
                            }
                            else{
                                uncommittedMovies.push(movie);
                                res.send(data);
                            }
                        });
                    }
                    else{
                        //if failed to lock node1, add to local list.
                        //let syncing function handle it later.
                        uncommittedMovies.push(movie);
                        res.send(data);
                    }
                });
            }
        }
        else{
            uncommittedMovies.push(movie);
            console.error("FAILED TO CONNECT TO THE DATABASES");
            res.send(data);
        }
    });
}

export function updateMovie(req, res){
    console.log("UPDATE MOVIE");
    var movie = new Movie(req.body.id, req.body.title, req.body.year, req.body.rating, req.body.nsynced, req.body.deleted);

    //add movie information
    var data = {
        node1: {
            connected: false,
            locked: false,
            inserted: false,
            unlocked: false
        },
        backupNode: {
            connected: false,
            locked: false,
            inserted: false,
            unlocked: false
        }
    };

    sql.findRecord(movie.id, function(altNode){
        if (altNode != null){
            var backupNode = (altNode == 2)? node2: node3;
            getConnections(node1, backupNode, function(conn1, conn2){
                if (conn1 != null){
                    data.node1.connected = true;
        
                    //lock necessary tables
                    if (conn2 != null){
                        data.backupNode.connected = true;
        
                        sql.lockTablesWrite(conn1, conn2, function(lockStatus){
                            if (lockStatus.conn1 == 200){
                                data.node1.locked = true;
        
                                //if successfully locked node1, insert
                                sql.updateMovie(conn1, movie, function(id, insert1Status){
                                    if (insert1Status == 200){
                                        if (lockStatus.conn2 == 200){
                                            //if lock 2 also successful, add to 2
                                            movie.id = id;
                                            data.backupNode.locked = true;
            
                                            //insert movie to other node
                                            sql.updateMovie(conn2, movie, function(id, insert2Status){
                                                //regardless of whether node2 was successful, node1 must be successful in committing
                                                sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                                    if (commit1Status.commit == 200){
                                                        data.node1.inserted = true;
        
                                                        //if node1 successfully committed, commit node2
                                                        if (insert2Status == 200){
                                                            sql.commitOrRollBackTransaction(conn2, function(commit2Status){
                                                                if (commit2Status.commit == 200)
                                                                    data.backupNode.inserted = true;
        
                                                                sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                                    if (unlockStatus.conn1 == 200)
                                                                        data.node1.unlocked = true;
                                                                    
                                                                    if (unlockStatus.conn2 == 200)
                                                                        data.backupNode.unlocked = true;
        
                                                                    res.send(data);
                                                                });
                                                            });
                                                        }
                                                        else{
                                                            sql.rollbackTransaction(conn2, function(rollback2Status){
                                                                sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                                    if (unlockStatus.conn1 == 200)
                                                                        data.node1.unlocked = true;
                                                                    
                                                                    if (unlockStatus.conn2 == 200)
                                                                        data.backupNode.unlocked = true;
        
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
                                                                if (unlockStatus.conn1 == 200)
                                                                    data.node1.unlocked = true;
                                                                    
                                                                if (unlockStatus.conn2 == 200)
                                                                    data.backupNode.unlocked = true;
        
                                                                res.send(data);
                                                            });
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            //if lock 2 not succesful, end transaction
                                            //if end transaction successful, unlock
                                            //if end transaction unsuccessful, add to local list, rollback then unlock
                                            sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                                if (commit1Status.commit != 200){
                                                    uncommittedMovies.push(movie);
                                                }
                                                else{
                                                    data.node1.inserted = true;
                                                }
            
                                                sql.unlockTable(conn1, function(unlock1Status){
                                                    if (unlock1Status == 200){
                                                        data.node1.unlocked = true;
                                                    }
        
                                                    res.send(data);
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
                                                data.backupNode.locked = true;
                                                sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                    if (unlockStatus.conn1 == 200)
                                                        data.node1.unlocked = true;
                                                        
                                                    if (unlockStatus.conn2 == 200)
                                                        data.backupNode.unlocked = true;
        
                                                    res.send(data);
                                                });
                                            }
                                            else{
                                                //only unlock 1
                                                sql.unlockTables(conn1, function(unlockStatus){
                                                    if (unlockStatus.conn1 == 200)
                                                        data.node1.unlocked = true;
                                                    
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
                                res.send(data);
                            }
                        });
                    }
                    else{
                        //if failed to connect to node2, add to node1 anyway
                        sql.lockTableWrite(conn1, function(lockStatus){
                            if (lockStatus == 200){
                                data.node1.locked = true;
        
                                sql.updateMovie(conn1, movie, function(id, insert1Status){
                                    if (insert1Status == 200){
                                        sql.commitOrRollBackTransaction(conn1, function(commit1Status){
                                            if(commit1Status.commit == 200){
                                                data.node1.inserted = true;
                                            }
                                            else{
                                                uncommittedMovies.push(movie);
                                            }
        
                                            sql.unlockTable(conn1, function(unlockStatus){
                                                if (unlockStatus == 200)
                                                    data.node1.unlocked = true;
                                                res.send(data);
                                            })
                                        });
                                    }
                                    else{
                                        uncommittedMovies.push(movie);
                                        res.send(data);
                                    }
                                });
                            }
                            else{
                                //if failed to lock node1, add to local list.
                                //let syncing function handle it later.
                                uncommittedMovies.push(movie);
                                res.send(data);
                            }
                        });
                    }
                }
                else{
                    uncommittedMovies.push(movie);
                    console.error("FAILED TO CONNECT TO THE DATABASES");
                    res.send(data);
                }
            });
        }
        else{
            uncommittedMovies.push(movie);
        }  
    });

}

export function deleteMovie(req, res){
    updateMovie(req, res);
}

export function searchMovie(req, res){
    //search node 1, node 2, and node 3
    res.send("SEARCH MOVIE");
}

export function verifyRecordIntegrity(req, res){
    
}

export function syncMovies(){
    if (!syncing){
        var arr = [];

        sql.lockTablesWrite(node1, node2, function(req, res){
            
        });
    }
    //add movies that failed to add
    //lock all nodes
    //node1 remains updated at all times only node2 and node3 are not
    //check if there are any nsynced movies in node1
    //
    //if deleted = 1, delete in node1
    //else if nsynced = 1, set nsynced = 0
    //else if nsynced = 2, 
    //check if there are any nsynced movies in current node
}