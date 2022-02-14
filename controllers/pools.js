import mysql from 'mysql';

export var node1 = mysql.createPool({
    host            : 'db4free.net',
    port            : 3306,
    user            : 'admin_g7_db1',
    password        : '@stadvdbProj1',
    database        : 'movies_g7_db1',
    connectionLimit : 100,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    multipleStatements: true
});

export var node2 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db2',
    password: '@stadvdbProj1',
    database: 'movies_g7_db2',
    connectionLimit: 100,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    multipleStatements: true
});

export var node3 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db3',
    password: '@stadvdbProj1',
    database: 'movies_g7_db3',
    connectionLimit: 100,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    multipleStatements: true
});

export function getConnection(pool, callback){
    pool.getConnection(function(err, conn){
        if (err){
            console.error(err);
            callback(null);
        }
        else{
            console.log("Connected to the node");
            callback(conn);
        }
    })
}

export function getConnections(pool1, pool2, callback){
    getConnection(pool1, function(n1_conn){
        if (n1_conn == null){
            console.error("Failed to connect to first node");
            callback(null, null);
        }
        else{
            console.log("Connected to first node");
            getConnection(pool2, function(n2_conn){
                if (n2_conn == null){
                    callback(n1_conn, null);
                    console.error("Failed to connect to second node");
                }
                else{
                    console.log("Connected to second node");
                    callback(n1_conn, n2_conn);
                }
            });
        }       
    });
}