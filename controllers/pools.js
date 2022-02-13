import mysql from 'mysql';

export var node1 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db1',
    password: '@stadvdbProj1',
    database: 'movies_g7_db1',
    connectionLimit: 5,
    multipleStatements: true
});

export var node2 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db2',
    password: '@stadvdbProj1',
    database: 'movies_g7_db2',
    connectionLimit: 5,
    multipleStatements: true
});

export var node3 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db3',
    password: '@stadvdbProj1',
    database: 'movies_g7_db3',
    connectionLimit: 5,
    multipleStatements: true
});

export function getConnections(pool1, pool2, callback){
    pool1.getConnection(function(err1, n1_conn){
        console.log("Connecting to Node 1...");
        if (err1){
            console.error(err1);
            callback(null, null);
        }
        else{
            console.log("Connected to Node 1");
            pool2.getConnection(function(err2, n2_conn){
                console.log("Connecting to Node 2...");
                if (err2){
                    console.error(err2);
                    callback(n1_conn, null);
                }
                else{
                    console.log("Connected to Node 2");
                    callback(n1_conn, n2_conn);
                }
            });
        }       
    });
}