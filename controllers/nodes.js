import { setNotUpdating, setUpdating } from "../public/js/user.js";
import { checkNodeActive, node1, node2, node3 } from "./pools.js";

/**
 * Inserts movie to the database. Calls callback after executing query.
 * @param {number, Connection} connInfo of node to insert to 
 * @param {Movie} movie to be inserted
 * @param {function} callback contains id and status code
 */
export function insertMovie(connInfo, movie, callback){
    var stmt = movie.queryString;
    var update_stmt = movie.updateString;
    var conn = connInfo.conn;

    console.log("IN FUNCTION");
    console.log(movie);
    console.log(stmt);
    console.log(update_stmt);

    if (checkNodeActive(connInfo.nodeid)){
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
    else{
        unlockTable(conn, function(status){
            callback(null, 500);
        });
    }
}

/**
 * Updates single entry in a database
 * @param {number, Connection} connInfo connection to be updated
 * @param {Movie} movie movie to be updated
 * @param {function} callback 
 * note, you can change array to sth else to make it easier.
 * see notes in user.js
 */
export function updateMovie(connInfo, movie, callback){
    insertMovie(connInfo, movie, callback);
}

/**
 * Marks single entry in a database as deleted
 * @param {number, Connection} connInfo that contains entry
 * @param {movie} movie of entry to be deleted
 * @param {function} callback
 */
export function deleteMovie(connInfo, movie, callback){
    insertMovie(connInfo, movie, callback);
}

/**
 * Searches for entries matching specific conditions in the database
 * @param {number, Connection} connInfo connection of database to be searched
 * @param {Movie} movie object containing values to search 
 * @param {function} callback
 */
export function searchMovie(connInfo, movie, callback){
    var search_query = "SELECT * FROM movies WHERE ";
    var search_stmt = movie.filterString;
    var conn = connInfo.conn;

    //if there are no fields/constraints
    if (search_stmt == "")
        search_query = "SELECT * FROM movies";

    if (checkNodeActive(connInfo.nodeid)){
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
    else{
        unlockTable(conn, function(status){
            callback([]);
        });
    }
}

/**
 * Locks the table for writing. Other connections cannot read or write.
 * @param {number, Connection} connInfo
 * @param {function} callback 
 */
export function lockTableWrite(connInfo, callback){
    var conn = connInfo.conn;
    setUpdating();

    if (checkNodeActive(connInfo.nodeid)){
        conn.query("SET autocommit = 0; LOCK TABLE movies WRITE;", function(err, res){
            console.log("LOCK TABLE WRITE");
            if(err){
                console.error(err);
                callback(503);
                setNotUpdating();
            }
            else{
                console.log(res);
                callback(200);
            }
        });
    }
    else{
        setNotUpdating();
        conn.release();
        callback(500);
    }
}

/**
 * Locks two tables for writing. Locks conn1 first then conn2.
 * Returns statuses in callback
 * conn2 is not locked if conn1 fails
 * 
 * @param {number, Connection} conn1
 * @param {number, Connection} conn2 
 * @param {function} callback 
 */
export function lockTablesWrite(conn1, conn2, callback){
    lockTableWrite(conn1, function(status){
        if (status == 200){
            lockTableWrite(conn2, function(status2){
                callback({conn1: status, conn2: status2});
            });
        }
        else{
            callback({conn1: status, conn2: null});
        }
    });
}

/**
 * Locks the table for reading. Other connections cannot write.
 * @param {number, Connection} connInfo
 * @param {function} callback 
 */
 export function lockTableRead(connInfo, callback){
    var conn = connInfo.conn;

    if (checkNodeActive(connInfo.nodeid)){
        conn.query("LOCK TABLE movies READ;", function(err, res){
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
    else{
        callback(500);
    }
}

export function lockTablesRead(conn1, conn2, callback){
    lockTableRead(conn1, function(status){
        if (status == 200){
            lockTableRead(conn2, function(status2){
                callback({conn1: status, conn2: status2});
            });
        }
        else{
            callback({conn1: status, conn2: null});
        }
    });
}


/**
 * Commits transactions for a connection
 * If failed, rolls back transaction
 * Sends 405 (Method Not Allowed) if failed
 * @param {number, Connection} connInfo
 * @param {function} callback 
 */
export function commitOrRollBackTransaction(connInfo, callback){
    var conn = connInfo.conn;

    if (checkNodeActive(connInfo.nodeid)){
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
    else{
        rollbackTransaction(conn, function(rollbackStatus){
            unlockTable(conn, function(status){
                callback({commit: 500, rollback: 500});
            });
        });
    }
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
        setNotUpdating();
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

export function findRecord(movie, callback){
    var id = movie.id;
    if (id != null){

        queryFunction({nodeid: 2, link: node2}, "SELECT * FROM movies WHERE id=" + id, function(err,res){
            if (res.length > 0){
                callback(2);
            }
            else {
                queryFunction({nodeid: 3, link: node3}, "SELECT * FROM movies WHERE id=" + id, function(err,res){
                    if (res.length > 0){
                        callback(3);
                    }
                    else {
                        queryFunction({nodeid: 1, link: node1}, "SELECT * FROM movies WHERE id=" + id, function(err,res){
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
    else{
        if (parseInt(movie.year) < 1980){
            callback(2);
        }
        else{
            callback(3);
        }
    }
}


export function queryFunction(obj, query, callback){
    var link = obj.link;

    if (obj.link != null)
        link = obj.link;
    
    if (obj.pool != null)
        link = obj.pool;

    if (obj.conn != null)
        link = obj.conn;

    if (checkNodeActive(obj.nodeid)){
        link.query(query, callback);
    }
    else{
        callback(true, []);
    }
}