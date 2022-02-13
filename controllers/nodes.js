const stmt_insert = "INSERT INTO movies (`id`, `name`, `year`, `rank`, `nsynced`) "
const stmt_delete = "DELETE FROM movies "
const stmt_update = "UPDATE movies "
const stmt_find = "SELECT * from movies "
const retry_time = 50;
const retry_count = 5;

/**
 * Inserts movie to the database. Calls callback after executing query.
 * @param {Connection} conn of node to insert to 
 * @param {Movie} movie to be inserted
 * @param {function} callback contains id and status code
 */
export function insertMovie(conn, movie, callback){
    var stmt = movie.queryString;

    conn.query("INSERT INTO " + stmt, function(err, res){
        console.log("INSERT TABLE");
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
 * Inserts single entry to the database
 * @param {mysqlpool} mysqlpool of node to insert to
 * @param {array} array of values to insert into database
 */
export function insertIntoPool(pool, arr){
    // stmt_values = "VALUES ('" + arr.join("', '") + "')";
    // pool.query(stmt_insert + stmt_values);
}

/**
 * Updates single entry in a database
 * @param {mysqlpool} mysqlpool to be updated
 * @param {number} id of entry to update
 * @param {array} array of values to update
 * note, you can change array to sth else to make it easier.
 * see notes in user.js
 */
export function updateOnePool(pool, id, arr){
    // stmt_set = "SET " + cond_arr.join("', '") + " ";
    // stmt_conditions = "WHERE id=" + id
    // pool.query(stmt_update + stmt_set + stmt_conditions);
}

/**
 * Marks single entry in a database as deleted
 * @param {mysqlpool} mysqlpool that contains entry
 * @param {id} id of entry to be deleted
 */
export function deleteOnePool(pool, id){
    // stmt_conditions = "WHERE " + arr.join("', '");
    // pool.query(stmt_delete + stmt_conditions);
}

/**
 * Searches for entries matching specific conditions in the database
 * @param {mysqlpool} mysqlpool to be searched
 * @param {obj} object containing values to search 
 */
export function searchPool(pool, obj){
    stmt_conditions = "WHERE " + arr.join("', '");
    pool.query(stmt_find + stmt_conditions);
}

/**
 * Locks the table for writing. Other connections cannot read or write.
 * @param {Connection} conn
 * @param {function} callback 
 */
export function lockTableWrite(conn, callback){
    lockTableWriteSingle(conn, callback, 0);
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
    lockTableWriteSingle(conn1, function(status){
        if (status == 200){
            lockTableWriteSingle(conn2, function(status2){
                callback({conn1: status, conn2: status2});
            }, 0);
        }
        else{
            callback({conn1: status, conn2: null});
        }
    }, 0);
}

/**
 * Recursive function for retrying locking multiple times.
 * @param {Connection} conn open connection to database
 * @param {function} callback returns status code
 * @param {number} retries number of retries 
 */
export function lockTableWriteSingle(conn, callback, retries){
    if (retries < retry_count){
        conn.query("SET autocommit = 0; LOCK TABLE movies WRITE;", function(err, res){
            console.log("LOCK TABLE WRITE SINGLE " + retries);
            if(err){
                console.error(err);
                callback(503);
                // // wait 100ms, try again x4
                // setTimeout(function(){
                //     lockTableWriteSingle(pool, callback, retries + 1)
                // }, retry_time);
            }
            else{
                console.log(res);
                callback(200);
            }
        });
    }
    else{
        callback(503);
    }
}

/**
 * Locks the table for reading. Other connections cannot write.
 * @param {mysqlpool} pool 
 * @param {function} callback 
 */
export function lockTableRead(pool, callback){
    pool.query("LOCK TABLE movies READ", function(err, res){
        console.log("LOCK TABLE");
        if(err){
            console.log(err);
        }
        else{
            console.log(res);
            callback();
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