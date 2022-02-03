const stmt_insert = "INSERT INTO movies (`id`, `name`, `year`, `rank`, `nsynced`) "

exports.utils = function(){
    return {
        insertMovie: function(pool, movie){
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
        },

        insertIntoPool: function(pool, arr){
            stmt_values = "VALUES ('" + arr.join("', '") + "')";
            pool.query(stmt_insert + stmt_values);
        }
    }
};