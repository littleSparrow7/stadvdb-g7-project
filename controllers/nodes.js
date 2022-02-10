const stmt_insert = "INSERT INTO movies (`id`, `name`, `year`, `rank`, `nsynced`) "
const stmt_delete = "DELETE FROM movies "
const stmt_update = "UPDATE movies "
const stmt_find = "SELECT * from movies "

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

export function insertIntoPool(pool, arr){
    stmt_values = "VALUES ('" + arr.join("', '") + "')";
    pool.query(stmt_insert + stmt_values);
}

export function updateIntoPool(pool, cond_arr, update_arr){
    stmt_set = "SET " + cond_arr.join("', '") + " ";
    stmt_conditions = "WHERE " + cond_arr.join("', '");
    pool.query(stmt_update + stmt_set + stmt_conditions);
}

export function deleteFromPool(pool, arr){
    stmt_conditions = "WHERE " + arr.join("', '");
    pool.query(stmt_delete + stmt_conditions);
}

export function findFromPool(pool ,arr){
    stmt_conditions = "WHERE " + arr.join("', '");
    pool.query(stmt_find + stmt_conditions);
}