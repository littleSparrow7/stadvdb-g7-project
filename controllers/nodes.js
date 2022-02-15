import { node1, node2, node3 } from "./pools.js";

/**
 * Inserts movie to the database. Calls callback after executing query.
 * @param {Connection} conn of node to insert to 
 * @param {Movie} movie to be inserted
 * @param {function} callback contains id and status code
 */
export function insertMovie(conn, movie, callback){
    var stmt = movie.queryString;
    var update_stmt = movie.updateString;

    conn.query("INSERT INTO " + stmt + " ON DUPLICATE KEY UPDATE " + update_stmt, function(err, res){
        console.log("MODIFY TABLE");
        if(err){
            console.error(err);
            callback(null, 500);
        }
        else{
            console.log(res);
            callback(res.insertId, 200);
        }
    });
}

/**
 * Updates single entry in a database
 * @param {Connection} conn connection to be updated
 * @param {Movie} movie movie to be updated
 * @param {function} callback 
 * note, you can change array to sth else to make it easier.
 * see notes in user.js
 */
export function updateMovie(conn, movie, callback){
    insertMovie(conn, movie, callback);
}

export function updateMovies(conn, movies, copy, fail, callback){
    if (movies.length > 0){
        var movie = movies.shift();

        updateMovie(conn, movie, function(id, status){
            if (status != 200){
                fail.push(movie);
            }
            
            copy.push(movie);
    
            updateMovies(conn, movies, copy, fail, callback);
        });
    }
    else{
        callback({copy, fail});
    }
}

/**
 * Marks single entry in a database as deleted
 * @param {Connection} conn that contains entry
 * @param {movie} movie of entry to be deleted
 * @param {function} callback
 */
export function deleteMovie(conn, movie, callback){
    insertMovie(conn, movie, callback);
}

/**
 * Searches for entries matching specific conditions in the database
 * @param {Connection} conn connection of database to be searched
 * @param {Movie} movie object containing values to search 
 */
export function searchMovie(conn, movie, callback){
    var search_query = "SELECT * FROM movies WHERE ";
    var search_stmt = movie.filterString;

    //if there are no fields/constraints
    if (search_stmt == "")
        search_query = "SELECT * FROM movies";

    conn.query(search_query + search_stmt, function(err, res){
        console.log("SELECT movie: " + search_stmt);
        if(err){
            console.error(err);
            callback(res);
        }
        else{
            console.log(res);
            callback(res);
        }
    });
}

/**
 * Locks the table for writing. Other connections cannot read or write.
 * @param {Connection} conn
 * @param {function} callback 
 */
export function lockTableWrite(conn, callback){
    conn.query("SET autocommit = 0; LOCK TABLE movies WRITE;", function(err, res){
        console.log("LOCK TABLE WRITE");
        if(err){
            console.error(err);
            callback(503);
        }
        else{
            console.log(res);
            callback(200);
        }
    });
}

/**
 * Locks two tables for writing. Locks conn1 first then conn2.
 * Returns statuses in callback
 * conn2 is not locked if conn1 fails
 * 
 * @param {Connection} conn1 
 * @param {Connection} conn2 
 * @param {function} callback 
 */
export function lockTablesWrite(conn1, conn2, callback){
    lockTableWrite(conn1, function(status){
        if (status == 200){
            lockTableWrite(conn2, function(status2){
                callback({conn1: status, conn2: status2});
            }, 0);
        }
        else{
            callback({conn1: status, conn2: null});
        }
    }, 0);
}

/**
 * Locks the table for reading. Other connections cannot write.
 * @param {Connection} conn
 * @param {function} callback 
 */
 export function lockTableRead(conn, callback){
    conn.query("SET autocommit = 0; LOCK TABLE movies READ;", function(err, res){
        console.log("LOCK TABLE READ");
        if(err){
            console.error(err);
            callback(503);
        }
        else{
            console.log(res);
            callback(200);
        }
    });
}

/**
 * Commits transactions for a connection
 * If failed, rolls back transaction
 * Sends 405 (Method Not Allowed) if failed
 * @param {Connection} conn
 * @param {function} callback 
 */
export function commitOrRollBackTransaction(conn, callback){
    conn.commit(function(err){
        console.log("COMMIT");
        if (err){
            console.error(err);
            rollbackTransaction(conn, function(rollbackStatus){
                callback({commit: 405, rollback: rollbackStatus});
            })
        }
        else{
            console.log("SUCCESSFULLY COMMITTED");
            callback({commit: 200, rollback: null});
        }
    });
}

/**
 * Rolls back transactions for a connection
 * Sends 502 (Bad Gateway) if failed
 * @param {Connection} conn 
 * @param {function} callback 
 */
export function rollbackTransaction(conn, callback){
    conn.rollback(function(err){
        console.log("ROLLBACK");
        if (err){
            console.error(err);
            callback(502);
        }
        else{
            console.log("SUCCESSFULLY ROLLED BACK");
            callback(200);
        }
    });
}

/**
 * Unlock tables from single database and releases connection.
 * Sends status code in callback.
 * Sends 423 (LOCKED) to callback if failed
 * @param {Connection} conn 
 * @param {function} callback 
 */
export function unlockTable(conn, callback){
    conn.query("UNLOCK TABLES", function(err){
        console.log("UNLOCK TABLE");
        conn.release();

        if(err){
            console.error(err);
            callback(423);
        }
        else{
            console.log("SUCCESSFULLY UNLOCKED TABLE");
            callback(200);
        }
    });
}

/**
 * Unlocks tables from two databases and releases connections.
 * Sends status codes in callback.
 * 
 * @param {Connection} conn1
 * @param {Connection} conn2
 * @param {function} callback 
 */
export function unlockTables(conn1, conn2, callback){
    unlockTable(conn1, function(status1){
        unlockTable(conn2, function(status2){
            callback({conn1: status1, conn2: status2});
        });
    });
}

export function findRecord(id, callback){
    node2.query("SELECT * FROM movies WHERE id=" + id, function(err,res){
        if (res.length > 0){
            callback(2);
        }
        else {
            node3.query("SELECT * FROM movies WHERE id=" + id, function(err,res){
                if (res.length > 0){
                    callback(3);
                }
                else {
                    node1.query("SELECT * FROM movies WHERE id=" + id, function(err,res){
                        if (err){
                            callback(null);
                        }
                        else if (res.length > 0){
                            if (res[0].year < 1980){
                                callback(2);
                            }
                            else{
                                callback(3);
                            }
                        }
                    });
                }
            });
        }
    });
}