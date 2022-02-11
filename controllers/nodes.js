const stmt_insert = "INSERT INTO movies (`id`, `name`, `year`, `rank`, `nsynced`) "
const stmt_delete = "DELETE FROM movies "
const stmt_update = "UPDATE movies "
const stmt_find = "SELECT * from movies "
const retry_time = 100;
const retry_count = 5;

/**
 * Inserts movie to the database. Returns id and status code in callback
 * @param {mysqlpool} mysqlpool of node to insert to 
 * @param {Movie} movie to be inserted
 */
export function insertMovie(pool, movie, callback){
    movie.nsynced = 1;
    var stmt = movie.queryString;

    pool.query("INSERT INTO " + stmt, function(err, res){
        if(err){
            console.log(err);
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
 * Tries 5 times before quitting
 * @param {mysqlpool} pool 
 * @param {function} callback 
 */
export function lockTableWrite(pool, callback){
    lockTableWriteSingle(pool, callback, 0);
}

/**
 * Locks two tables for writing. Locks pool1 first then pool2.
 * Returns status in callback
 * 
 * @param {mysqlpool} pool1 
 * @param {mysqlpool} pool2 
 * @param {function} callback 
 */
export function lockTablesWrite(pool1, pool2, callback){
    lockTableWriteSingle(pool1, function(status){
        if (status == 200){
            lockTableWriteSingle(pool2, callback, 0);
        }
        else{
            callback(status);
        }
    }, 0);
}

/**
 * Recursive function for retrying locking multiple times.
 * @param {mysqlpool} pool 
 * @param {function} callback 
 * @param {retries} number of retries 
 */
export function lockTableWriteSingle(pool, callback, retries){
    if (retries < retry_count){
        pool.query("LOCK TABLE movies WRITE", function(err, res){
            if(err){
                console.log(err);
                // wait 100ms, try again x4
                setTimeout(function(){
                    lockTableWriteSingle(pool, callback, retries + 1)
                }, retry_time);
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
 * Unlock tables from single database. Sends status code in callback.
 * @param {mysqlpool} pool 
 * @param {function} callback 
 */
export function unlockTable(pool, callback){
    pool.query("UNLOCK TABLES", function(err, res){
        if(err){
            console.log(err);
            callback(500);
        }
        else{
            console.log(res);
            callback(200);
        }
    });
}

/**
 * Unlock tables from two databases. Sends status code in callback.
 * @param {mysqlpool} pool 
 * @param {function} callback 
 */
export function unlockTables(pool1, pool2, callback){
    unlockTable(pool1, function(status){
        if (status == 200){
            unlockTable(pool2, callback);
        }
        else{
            callback(status);
        }
    });
}