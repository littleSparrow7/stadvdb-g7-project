import express from 'express';
export var test = express.Router();
import {getConnection, node1, node2, node3} from '../controllers/pools.js';
import * as sql from '../controllers/nodes.js';
import * as node1Controller from '../controllers/node1.js';
import Movie from '../public/js/movie.js';

test.get('/test', function(req, res){
    console.log("test");
});

test.get('/check1', function(req,res){
    node1.query("select * from movies order by id desc limit 10", function(error, result){
        if(error){
            res.send(error);
        }
        else{
            res.send(result);
        }
    })
});

test.get('/check2', function(req,res){
    node2.query("select * from movies order by id desc limit 10", function(error, result){
        if(error){
            res.send(error);
        }
        else{
            res.send(result);
        }
    })
});

test.get('/check3', function(req,res){
    node3.query("select * from movies order by id desc limit 10", function(error, result){
        if(error){
            res.send(error);
        }
        else{
            res.send(result);
        }
    })
});

test.get('/add1', function (req,res){
    var movie = new Movie(null, "Title", 1984, null, 1, 0);
    sql.insertMovie(node1, movie, function(result){
        res.send(result);
    });
});

test.get('/add1Node', function (req,res){
    var movie = {
        title: "How I Made A Billion Dollars 2",
        year: 1973,
        rank: null,
        nsynced: 1,
        deleted: 0
    };
    node1Controller.addMovie(movie, res);
    // sql.insertMovie(node1, movie, function(result){
    //     res.send(result);
    // });
});


test.get('/locks1', function(req, res){
    console.log("LOCKING");
    sql.lockTablesWrite(node1, node2, function(status){
        sql.unlockTables(node1, node2, function(status2){
            res.send({lock: status, unlock: status2});
        });
    })
});

test.get('/lockStatus', function(req, res){
    console.log("LOCK STATUS");
    var query = "SHOW OPEN TABLES";
    node1.query(query, function(err, result1){
        if (err){
            console.log(err);
        }

        node2.query(query, function(err, result2){
            if (err){
                console.log(err);
            }

            node3.query(query, function(err, result3){
                if (err){
                    console.log(err);
                }
                
                console.log("RESULTS");
                res.send({result1, result2, result3});
            });
        }); 
    });
});

test.get('/tableStatus', function(req, res){
    var query = "SHOW FULL PROCESSLIST";
    node1.query(query, function(err, result1){
        node2.query(query, function(err, result2){
            node3.query(query, function(err, result3){
                res.send({result1, result2, result3});
            });
        }); 
    });
});


test.get('/killProcessLists', function(req, res){
    var query = "SHOW FULL PROCESSLIST";
    var kill_query = "KILL ";
    node1.query(query, function(err, result1){
        node2.query(query, function(err, result2){
            node3.query(query, function(err, result3){
                res.send({result1, result2, result3});
                result3.forEach((p) => {
                    if (p.Command == "Sleep"){
                        node3.query(kill_query + p.Id);
                        console.log(p.Id);
                    }
                });
            });

            result2.forEach((p) => {
                if (p.Command == "Sleep"){
                    node2.query(kill_query + p.Id);
                    console.log(p.Id);
                }
            });
        });

        result1.forEach((p) => {
            if (p.Command == "Sleep" || p.State=="Waiting for table metadata lock"){
                node1.query(kill_query + p.Id);
                console.log(p.Id);
            }
        });
    });
})

test.get('/testRollback', function(req, res){
    var movie = new Movie(null, "A C6 Character Would Be Nice", 2031, null, 1, 0);
    node1.getConnection(function(err, n1_conn){
        if (err){
            console.error(err);
        }
        else{

            console.log(n1_conn);
            console.log("Connected to Node 1");

            n1_conn.query("SET autocommit = 0; LOCK TABLE movies WRITE;", function (err2, res1){
                console.log("LOCK TABLES;");
                if (err2){
                    console.error(err2);
                }
                else{

                    console.log(res1);
                    n1_conn.query("INSERT INTO " + movie.queryString, function (err3, res2){
                        console.log("INSERT");
                        if (err3){
                            console.error(err3);
                        }
                        else{
                            console.log(res2);

                            n1_conn.commit(function (err4){
                                console.log("COMMIT");
                                if (err4){
                                    console.error(err4);
                                }
                                else{                                    
                                    n1_conn.query("UNLOCK TABLES;", function (err5, res4){
                                        console.log("END TRANSACTION");
                                        n1_conn.release();
                                        if (err5){
                                            res.send(err5);
                                            console.error(err5);
                                        }
                                        else{
                                            res.send(res4);
                                            console.log(res4);
                                        }
                                    });
                                }
                
                            });
                        }
        
                    });
                }

            });
        }
    });
});

// test.get('/deleteOne', function(req,res){
//     node1.query("DELETE FROM movies WHERE id=412342", function(err,result){
//         res.send(result);
//     });
// });