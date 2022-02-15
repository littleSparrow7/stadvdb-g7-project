import { node1, node2, node3, getConnections, getConnection } from './pools.js';
import * as sql from "./nodes.js";
import Movie from '../public/js/movie.js';
import { uncommittedMovies } from '../public/js/user.js';

export function addMovie(req, res){
    console.log("INSERT MOVIE");
    var movie = new Movie(null, req.body.title, req.body.year, req.body.rating, req.body.nsynced, req.body.deleted);
    insertOne(movie, function(data){
        res.send(data);
    });
}

export function updateMovie(req, res){
    console.log("UPDATE MOVIE");
    var movie = new Movie(req.body.id, req.body.title, req.body.year, req.body.rating, req.body.nsynced, req.body.deleted);
    updateOne(movie, function(data){
        res.send(data);
    });
}

function updateOne(movie, callback){
    console.log("UPDATE MOVIE");

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
            var altNodeInfo = null;
            if (altNode == 2){
                altNodeInfo = {
                    nodeid: 2,
                    link: node2
                };
            }
            else{
                altNodeInfo = {
                    nodeid: 3,
                    link: node3
                };
            }

            var node1Info = {
                nodeid: 1,
                link: node1
            };

            getConnections(node1Info, altNodeInfo, function(conn1, conn2){
                var conn1Info = {
                    nodeid: 1,
                    conn: conn1
                };

                var conn2Info = {
                    nodeid: altNodeInfo.nodeid,
                    conn: conn2
                };

                if (conn1 != null){
                    data.node1.connected = true;
        
                    //lock necessary tables
                    if (conn2 != null){
                        data.backupNode.connected = true;
        
                        sql.lockTablesWrite(conn1Info, conn2Info, function(lockStatus){
                            if (lockStatus.conn1 == 200){
                                data.node1.locked = true;
        
                                //if successfully locked node1, insert
                                sql.updateMovie(conn1Info, movie, function(id, insert1Status){
                                    if (insert1Status == 200){
                                        if (lockStatus.conn2 == 200){
                                            //if lock 2 also successful, add to 2
                                            movie.id = id;
                                            data.backupNode.locked = true;
            
                                            //insert movie to other node
                                            sql.updateMovie(conn2Info, movie, function(id, insert2Status){
                                                //regardless of whether node2 was successful, node1 must be successful in committing
                                                sql.commitOrRollBackTransaction(conn1Info, function(commit1Status){
                                                    if (commit1Status.commit == 200){
                                                        data.node1.inserted = true;
        
                                                        //if node1 successfully committed, commit node2
                                                        if (insert2Status == 200){
                                                            sql.commitOrRollBackTransaction(conn2Info, function(commit2Status){
                                                                if (commit2Status.commit == 200)
                                                                    data.backupNode.inserted = true;
        
                                                                sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                                    if (unlockStatus.conn1 == 200)
                                                                        data.node1.unlocked = true;
                                                                    
                                                                    if (unlockStatus.conn2 == 200)
                                                                        data.backupNode.unlocked = true;
        
                                                                    callback(data);
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
        
                                                                    callback(unlockStatus);
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
        
                                                                callback(data);
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
                                            sql.commitOrRollBackTransaction(conn1Info, function(commit1Status){
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
        
                                                    callback(data);
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
        
                                                    callback(data);
                                                });
                                            }
                                            else{
                                                //only unlock 1
                                                sql.unlockTables(conn1, function(unlockStatus){
                                                    if (unlockStatus.conn1 == 200)
                                                        data.node1.unlocked = true;
                                                    
                                                    callback(unlockStatus);
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
                                callback(data);
                            }
                        });
                    }
                    else{
                        //if failed to connect to node2, add to node1 anyway
                        sql.lockTableWrite(conn1Info, function(lockStatus){
                            if (lockStatus == 200){
                                data.node1.locked = true;
        
                                sql.updateMovie(conn1Info, movie, function(id, insert1Status){
                                    if (insert1Status == 200){
                                        sql.commitOrRollBackTransaction(conn1Info, function(commit1Status){
                                            if(commit1Status.commit == 200){
                                                data.node1.inserted = true;
                                            }
                                            else{
                                                uncommittedMovies.push(movie);
                                            }
        
                                            sql.unlockTable(conn1, function(unlockStatus){
                                                if (unlockStatus == 200)
                                                    data.node1.unlocked = true;
                                                callback(data);
                                            })
                                        });
                                    }
                                    else{
                                        uncommittedMovies.push(movie);
                                        callback(data);
                                    }
                                });
                            }
                            else{
                                //if failed to lock node1, add to local list.
                                //let syncing function handle it later.
                                uncommittedMovies.push(movie);
                                callback(data);
                            }
                        });
                    }
                }
                else{
                    uncommittedMovies.push(movie);
                    console.error("FAILED TO CONNECT TO THE DATABASES");
                    callback(data);
                }
            });
        }
        else{
            uncommittedMovies.push(movie);
        }  
    });
}

function updateMany(movies, length, callback){
    if (length > 0){
        var movie = movies.shift();
    
        updateOne(movie, function(data){
            console.log(data);
            updateMany(movies, length - 1, callback);
        });
    }
    else{
        callback(200);
    }
}

export function deleteMovie(req, res){
    updateMovie(req, res);
}

export function searchMovie(req, res){
    var params = new URLSearchParams(req._parsedUrl.query);
    
    var body = {
        id: params.get('id'),
        title: params.get('title'),
        year: params.get('year'),
        rating: params.get('rating'),
        nsynced: params.get('nsynced'),
        deleted: params.get('deleted')
    };

    var movie = new Movie(body.id, body.title, body.year, body.rating, body.nsynced, body.deleted);
    var data = {
        error : false,
        result: null
    };

    var node1Info = {
        nodeid: 1,
        link: node1
    };

    getConnection(node1Info, function(conn1){ 
        var conn1Info = {
            nodeid: 1,
            conn: conn1
        };
        if (conn1 != null){
            sql.lockTableRead(conn1Info, function(status){
                if (status == 200){
                    sql.searchMovie(conn1Info, movie, function(result){
                        sql.unlockTable(conn1, function(status){
                            data.result = result;
                            res.send(data);
                        })
                    });
                }
                else{
                    res.send(data);
                }
            });
        }
        else{
            var node2Info = {
                nodeid: 2,
                link: node2
            };

            var node3Info = {
                nodeid: 3,
                link: node3
            };
            getConnection(node2Info, function(conn2){
                getConnection(node3Info, function(conn3){
                    var conn2Info = {
                        nodeid: 2,
                        conn: conn2
                    };

                    var conn3Info = {
                        nodeid: 3,
                        conn: conn3
                    };

                    var conns = [];
                    if (conn2 != null){
                        conns.push(conn2Info);
                    }

                    if (conn3 != null){
                        conns.push(conn3Info);
                    }

                    if (conns.length > 0){
                        sql.lockTableRead(conns[0], function(status2){
                            if (conns.length > 1){
                                sql.lockTableRead(conns[1], function(status3){
                                    if (status2 != 200){
                                        conns.shift();
                                    }
                                    else if (status3 != 200){
                                        conns.pop();
                                    }

                                    if (conns.length > 0){
                                        sql.searchMovie(conns[0], movie, function(result1){
                                            if (conns.length > 1){
                                                sql.searchMovie(conns[1], movie, function(result2){
                                                    sql.unlockTables(conns[0].conn, conns[1].conn, function(status){
                                                        data.result = result1.concat(result2);
                                                        res.send(data);
                                                    })
                                                });
                                            }
                                            else{
                                                sql.unlockTable(conns[0].conn, function(status){
                                                    data.result = result1;
                                                    res.send(data);
                                                });
                                            }
                                        });
                                    }
                                    else{
                                        data.error = true;
                                        data.result = [];
                                        res.send(data);
                                    }
                                });
                            }
                            else{
                                if (status2 == 200){
                                    sql.searchMovie(conns[0], movie, function(result){
                                        sql.unlockTable(conns[0].conn, function(status){
                                            data.result = result;
                                            res.send(data);
                                        });
                                    });
                                }
                                else {
                                    sql.unlockTable(conns[0].conn, function(status){
                                        data.error = true;
                                        data.result = [];
                                        res.send(data);
                                    });
                                }
                            }
                        });
                    }
                    else{
                        data.error = true;
                        data.result = [];
                        console.log("FAILED TO CONNECT TO DATABASES");
                    }
                });
            });
        }
    });
    //search node 1
    // if node1 not available, search node 2, and node 3
    console.log("SEARCH MOVIE");
}

/**
 * Deletes all records that do not belong to the node
 * @param {number} nodeid number of the node (2 for node2; 3 for node3)
 */
export function verifyRecordIntegrity(nodeid, callback){
    console.log("VERIFY RECORD INTEGRITY");

    var nodeInfo = null;
    var query = "";
    if (nodeid == 2){
        nodeInfo = {nodeid: 2, pool: node2};
        query = "UPDATE movies SET deleted = 1 WHERE year >= 1980";
    }
    else if (nodeid == 3){
        nodeInfo = {nodeid: 3, pool: node3};
        query = "UPDATE movies SET deleted = 1 WHERE year < 1980";
    }
    
    if (nodeInfo != null){
        getConnection(nodeInfo, function(conn){
            if (conn != null){
                var connInfo = {nodeid: nodeInfo.nodeid, conn: conn};
                sql.lockTableWrite(connInfo, function(status){
                    if (status == 200){
                        sql.queryFunction(connInfo, query, function(err, res){
                            sql.commitOrRollBackTransaction(connInfo, function(res){
                                if (res != 200){
                                    console.log("VERIFY FILE INTEGRITY: FAILED TO COMMIT CHANGES");
                                }
                                else{
                                    console.log("VERIFY FILE INTEGRITY: COMMITTED CHANGES SUCCESFULLY");
                                }

                                sql.unlockTable(conn, function(res){
                                    console.log("FINISHED VERIFYING FILE INTEGRITY");
                                    callback(200);
                                });
                            });
                        });
                    }
                    else{
                        console.error("VERIFY FILE INTEGRITY: FAILED TO ACQUIRE LOCK");
                        callback(500);
                    }
                });
            }
            else{
                console.error("VERIFY FILE INTEGRITY: SERVER BUSY");
                callback(500);
            }
        });
    }
    else{
        console.log("FINISHED VERIFYING FILE INTEGRITY");
        callback(200);
    }
}

export function syncMovies(){
    var length = uncommittedMovies.length;
    //add movies that failed to add
    updateMany(uncommittedMovies, length, function(){
        syncTwoNodes("WHERE year < 1980 AND nsynced > 0", node2, function(res1){
            syncTwoNodes("WHERE year >= 1980 AND nsynced > 0", node3, function(res2){
                console.log("FINISHED SYNCING DATA");
                console.log(res1);
                console.log(res2);
            });
        });
    });
}

function insertOne(movie, callback){
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
    var node1Info = {
        nodeid: 1,
        pool: node1
    };

    var backupNodeInfo = null;
    if (movie.year < 1980){
        backupNodeInfo = {
            nodeid: 2,
            pool: node2
        };
    }
    else{
        backupNodeInfo = {
            nodeid: 3,
            pool: node3
        };
    }
    
    // console.log(movie);



    getConnections(node1Info, backupNodeInfo, function(conn1, conn2){
        if (conn1 != null){
            var conn1Info = {
                nodeid: 1,
                conn: conn1
            };

            var conn2Info = {
                nodeid: backupNodeInfo.nodeid,
                conn: conn2
            };

            data.node1.connected = true;

            //lock necessary tables
            if (conn2 != null){
                data.backupNode.connected = true;

                sql.lockTablesWrite(conn1Info, conn2Info, function(lockStatus){
                    if (lockStatus.conn1 == 200){
                        data.node1.locked = true;

                        //if successfully locked node1, insert
                        sql.insertMovie(conn1Info, movie, function(id, insert1Status){
                            if (insert1Status == 200){
                                if (lockStatus.conn2 == 200){
                                    //if lock 2 also successful, add to 2
                                    movie.id = id;
                                    data.backupNode.locked = true;
    
                                    //insert movie to other node
                                    sql.insertMovie(conn2Info, movie, function(id, insert2Status){
                                        //regardless of whether node2 was successful, node1 must be successful in committing
                                        sql.commitOrRollBackTransaction(conn1Info, function(commit1Status){
                                            if (commit1Status.commit == 200){
                                                data.node1.inserted = true;

                                                //if node1 successfully committed, commit node2
                                                if (insert2Status == 200){
                                                    sql.commitOrRollBackTransaction(conn2Info, function(commit2Status){
                                                        if (commit2Status.commit == 200)
                                                            data.backupNode.inserted = true;

                                                        sql.unlockTables(conn1, conn2, function(unlockStatus){
                                                            if (unlockStatus.conn1 == 200)
                                                                data.node1.unlocked = true;
                                                            
                                                            if (unlockStatus.conn2 == 200)
                                                                data.backupNode.unlocked = true;

                                                            callback(data);
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

                                                            callback(unlockStatus);
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

                                                        callback(data);
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
                                    sql.commitOrRollBackTransaction(conn1Info, function(commit1Status){
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

                                            callback(data);
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

                                            callback(data);
                                        });
                                    }
                                    else{
                                        //only unlock 1
                                        sql.unlockTables(conn1, function(unlockStatus){
                                            if (unlockStatus.conn1 == 200)
                                                data.node1.unlocked = true;
                                            
                                            callback(unlockStatus);
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
                        callback(data);
                    }
                });
            }
            else{
                //if failed to connect to node2, add to node1 anyway
                sql.lockTableWrite(conn1Info, function(lockStatus){
                    if (lockStatus == 200){
                        data.node1.locked = true;

                        sql.insertMovie(conn1Info, movie, function(id, insert1Status){
                            if (insert1Status == 200){
                                sql.commitOrRollBackTransaction(conn1Info, function(commit1Status){
                                    if(commit1Status.commit == 200){
                                        data.node1.inserted = true;
                                    }
                                    else{
                                        uncommittedMovies.push(movie);
                                    }

                                    sql.unlockTable(conn1, function(unlockStatus){
                                        if (unlockStatus == 200)
                                            data.node1.unlocked = true;
                                        callback(data);
                                    })
                                });
                            }
                            else{
                                uncommittedMovies.push(movie);
                                callback(data);
                            }
                        });
                    }
                    else{
                        //if failed to lock node1, add to local list.
                        //let syncing function handle it later.
                        uncommittedMovies.push(movie);
                        callback(data);
                    }
                });
            }
        }
        else{
            uncommittedMovies.push(movie);
            console.error("FAILED TO CONNECT TO THE DATABASES");
            callback(data);
        }
    });
}

async function insertSingleRow(connInfo, movie){
    return new Promise((resolve, reject) => {
        try{
            sql.insertMovie(connInfo, movie, function(id, status){
                if (status != 200){
                    resolve(500);
                }
                else{
                    sql.commitOrRollBackTransaction(connInfo, function(commitStatus){
                        if (commitStatus.commit != 200){
                            resolve(500);
                        }
                        else{
                            resolve(200); 
                        }
                    });
                }
            });
        }
        catch (e){
            console.error(e);
            resolve(500);
        }
    });
}

function syncTwoNodes(query, nodeInfo, callback){
    var node1Info = {
        nodeid: 1,
        link: node1
    };

    getConnection(node1Info, function(conn1){
        if (conn1 != null){
            var conn1Info = {
                nodeid: 1,
                conn: conn1
            };
            sql.lockTableRead(conn1Info, function(status){
                if (status == 200){
                    sql.queryFunction(conn1Info, "SELECT * FROM movies " + query, function(err, res){
                        sql.unlockTable(conn1Info, function(status){
                            if (err){
                                console.error(err);
                                callback(500);
                            }
                            else {
                                if (res.length > 0){
                                    var length = res.length;

                                    getConnections(node1Info, nodeInfo, function(conn1, conn2){
                                        var conn1Info = {
                                            nodeid: 1,
                                            conn: conn1
                                        };

                                        var conn2Info = {
                                            nodeid: nodeInfo.nodeid,
                                            conn: conn2
                                        };

                                        if (conn1 != null && conn2 != null){

                                            sql.lockTableWrite(conn1Info, function(status1){
                                                sql.lockTableWrite(conn2Info, function(status2){
                                                    (async ()=>{
                                                        try{
                                                            if (status1 == 200 && status2 == 200){
                                                                for(let i = 0; i < length; i++){
                                                                    var data = res.shift();
                                                                    
                                                                    var movie = new Movie(data.id, data.name, data.year, data.rank, 0, data.deleted);
                                                                    console.log(movie);

                                                                    var result2 = await insertSingleRow(conn2Info, movie);
            
                                                                    if (result2 == 200){
                                                                        var result1 = await insertSingleRow(conn1Info, movie);
                                                                    }
            
                                                                    if (i == length - 1){
                                                                        sql.unlockTables(conn1, conn2, function(status){
                                                                            callback(200);
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                            else{
                                                                sql.unlockTables(conn1, conn2, function(status){
                                                                    callback(500);
                                                                });
                                                            }
        
                                                        }catch(e){
                                                            sql.unlockTables(conn1, conn2, function(status){
                                                                console.log(e);
                                                                callback(500);
                                                            });      
                                                        }
                                                    })();
                                                });
                                            });
                                        }
                                        else{
                                            callback(500);
                                        }
                                    });
                                    
                                }
                                else{
                                    console.log("NOTHING TO UPDATE");
                                    callback (200);
                                }
                            }
                        });
                    });
                }
                else{
                    callback(500);
                }
            });
        }
        else{
            callback(500);
        }
    });
}