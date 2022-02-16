import express from "express";
import * as nodeController from "../controllers/nodeController.js";

export var router = express.Router();

// GET request for getting top ten movies
router.get('/topTen', nodeController.getTopTen);
router.get('/recentTen', nodeController.getRecentTen);

// *** NODE 1 ***
// POST request for adding a movie from node1
router.post('/node1/addMovie', nodeController.addMovie);

// POST request for updating a movie from node1
router.post('/node1/updateMovie', nodeController.updateMovie);

// POST request for deleting a movie from node1
router.post('/node1/deleteMovie', nodeController.deleteMovie);

// GET request for searching a movie from node1
router.get('/node1/searchMovie', nodeController.searchMovie);

// *** NODE 2 ***
// POST request for adding a movie from node2
router.post('/node2/addMovie', nodeController.addMovie);

// POST request for updating a movie from node2
router.post('/node2/updateMovie', nodeController.updateMovie);

// POST request for deleting a movie from node2
router.post('/node2/deleteMovie', nodeController.deleteMovie);

// GET request for searching a movie from node2
router.get('/node2/searchMovie', nodeController.searchMovie);

// *** NODE 3 ***
// POST request for adding a movie from node3
router.post('/node3/addMovie', nodeController.addMovie);

// POST request for updating a movie from node3
router.post('/node3/updateMovie', nodeController.updateMovie);

// POST request for deleting a movie from node3
router.post('/node3/deleteMovie', nodeController.deleteMovie);

// GET request for searching a movie from node3
router.get('/node3/searchMovie', nodeController.searchMovie);