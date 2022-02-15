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

var node1IsActive = true;
var node2IsActive = true;
var node3IsActive = true;

export function checkNodeActive(nodeid){
    if (nodeid == 1)
        return node1IsActive;
    else if (nodeid == 2)
        return node2IsActive;
    else if (nodeid == 3)
        return node3IsActive;
}

export function setNodeInactive(nodeid){
    if (nodeid == 1)
        node1IsActive = false;
    else if (nodeid == 2)
        node2IsActive = false;
    else if (nodeid == 3)
        node3IsActive = false;
}

export function setNodeActive(nodeid){
    if (nodeid == 1)
        node1IsActive = true;
    else if (nodeid == 2)
        node2IsActive = true;
    else if (nodeid == 3)
        node3IsActive = true;
}

export function getConnection(poolInfo, callback){
    var pool = poolInfo.pool;

    if (checkNodeActive(poolInfo.nodeid)){
        pool.getConnection(function(err, conn){
            if (err){
                console.error(err);
                callback(null);
            }
            else{
                console.log("Connected to the node");
                callback(conn);
            }
        });
    }
    else{
        callback(null);
    }
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