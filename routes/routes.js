import express from "express";
import * as node1Controller from "../controllers/node1.js";
import * as node2Controller from "../controllers/node2.js";
import * as node3Controller from "../controllers/node3.js";

export var router = express.Router();

// *** NODE 1 ***
// POST request for adding a movie from node1
router.post('/node1/addMovie', node1Controller.addMovie);

// POST request for updating a movie from node1
router.post('/node1/updateMovie', node1Controller.updateMovie);

// POST request for deleting a movie from node1
router.post('/node1/deleteMovie', node1Controller.deleteMovie);

// GET request for searching a movie from node1
router.get('/node1/searchMovie', node1Controller.searchMovie);

// *** NODE 2 ***
// POST request for adding a movie from node2
router.post('/node2/addMovie', node2Controller.addMovie);

// POST request for updating a movie from node2
router.post('/node2/updateMovie', node2Controller.updateMovie);

// POST request for deleting a movie from node2
router.post('/node2/deleteMovie', node2Controller.deleteMovie);

// GET request for searching a movie from node2
router.get('/node2/searchMovie', node2Controller.searchMovie);

// *** NODE 3 ***
// POST request for adding a movie from node3
router.post('/node3/addMovie', node3Controller.addMovie);

// POST request for updating a movie from node3
router.post('/node3/updateMovie', node3Controller.updateMovie);

// POST request for deleting a movie from node3
router.post('/node3/deleteMovie', node3Controller.deleteMovie);

// GET request for searching a movie from node3
router.get('/node3/searchMovie', node1Controller.searchMovie);