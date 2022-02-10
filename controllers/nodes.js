const stmt_insert = "INSERT INTO movies (`id`, `name`, `year`, `rank`, `nsynced`) "
const stmt_delete = "DELETE FROM movies "
const stmt_update = "UPDATE movies "
const stmt_find = "SELECT * from movies "

/**
 * Inserts movie to the database
 * @param {mysqlpool} mysqlpool of node to insert to 
 * @param {Movie} movie to be inserted
 */
export function insertMovie(pool, movie){
    stmt_values = movie.valuesString;

    pool.query(stmt_insert + stmt_values, function(err, res){
        if(err){
            console.log(err);
        }
        else{
            console.log(res);
            // res.insertId
        }
    });
}

/**
 * Inserts single entry to the database
 * @param {mysqlpool} mysqlpool of node to insert to
 * @param {array} array of values to insert into database
 */
export function insertIntoPool(pool, arr){
    stmt_values = "VALUES ('" + arr.join("', '") + "')";
    pool.query(stmt_insert + stmt_values);
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
    //stmt_conditions = "WHERE movie.id = " + id;
    //pool.query(stmt_delete + stmt_conditions);
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