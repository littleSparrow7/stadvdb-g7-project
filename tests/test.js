import express from 'express';
export var test = express.Router();
import {checkNodeActive, node1, node2, node3, setNodeActive, setNodeInactive} from '../controllers/pools.js';
import * as sql from '../controllers/nodes.js';
import * as nodeController from '../controllers/nodeController.js';
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
    node2.query("select * from movies order by id desc limit 20", function(error, result){
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
    nodeController.addMovie(movie, res);
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
                    if (p.Command == "Sleep" || p.State=="Waiting for table metadata lock"){
                        node3.query(kill_query + p.Id);
                        console.log(p.Id);
                    }
                });
            });

            result2.forEach((p) => {
                if (p.Command == "Sleep" || p.State=="Waiting for table metadata lock"){
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

test.get('/testFunction', function(req, res){
    node1.query("SELECT COUNT(*) AS count FROM movies WHERE deleted = 1", function(err, res){
        console.log("node1:" + res[0].count);
    });

    node2.query("SELECT COUNT(*) AS count FROM movies WHERE deleted = 1", function(err, res){
        console.log("node2:" + res[0].count);
    });

    node3.query("SELECT COUNT(*) AS count FROM movies WHERE deleted = 1", function(err, res){
        console.log("node3:" + res[0].count);
    });
});

test.get('/node1/inactive', function(req, res){
    setNodeInactive(1);
    res.send({
        node1: checkNodeActive(1),
        node2: checkNodeActive(2),
        node3: checkNodeActive(3)
    });
});

test.get('/node2/inactive', function(req, res){
    setNodeInactive(2);
    res.send({
        node1: checkNodeActive(1),
        node2: checkNodeActive(2),
        node3: checkNodeActive(3)
    });
});

test.get('/node3/inactive', function(req, res){
    setNodeInactive(3);
    res.send({
        node1: checkNodeActive(1),
        node2: checkNodeActive(2),
        node3: checkNodeActive(3)
    });
});

test.get('/node1/active', function(req, res){
    setNodeActive(1);
    res.send({
        node1: checkNodeActive(1),
        node2: checkNodeActive(2),
        node3: checkNodeActive(3)
    });
});

test.get('/node2/active', function(req, res){
    setNodeActive(2);
    res.send({
        node1: checkNodeActive(1),
        node2: checkNodeActive(2),
        node3: checkNodeActive(3)
    });
});

test.get('/node3/active', function(req, res){
    setNodeActive(3);
    res.send({
        node1: checkNodeActive(1),
        node2: checkNodeActive(2),
        node3: checkNodeActive(3)
    });
});

// test.get('/deleteOne', function(req,res){
//     node3.query("DELETE FROM movies WHERE id >= 412327 AND id <= 412358", function(err,result){
//         res.send(result);
//     });
// });