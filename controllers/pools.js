import mysql from 'mysql';

export var node1 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db1',
    password: '@stadvdbProj1',
    database: 'movies_g7_db1',
    connectionLimit: 100,
    multipleStatements: true
});

export var node2 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db2',
    password: '@stadvdbProj1',
    database: 'movies_g7_db2',
    connectionLimit: 100,
    multipleStatements: true
});

export var node3 = mysql.createPool({
    host: 'db4free.net',
    port: 3306,
    user: 'admin_g7_db3',
    password: '@stadvdbProj1',
    database: 'movies_g7_db3',
    connectionLimit: 100,
    multipleStatements: true
});