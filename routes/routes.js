import express from "express";
import * as node1Controller from "../controllers/node1.js";

export var router = express.Router();

// POST request for adding a movie from node1
router.post('/node1/addMovie', node1Controller.addMovie);

// POST request for updating a movie from node1
router.post('/node1/:id/updateMovie', node1Controller.updateMovie);

// POST request for deleting a movie from node1
router.post('/node1/:id/deleteMovie', node1Controller.deleteMovie);

// GET request for searching a movie from node1
router.get('/node1/searchMovie', node1Router.searchMovie);