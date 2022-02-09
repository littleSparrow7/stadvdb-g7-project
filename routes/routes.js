const express = require("express");
const router = express.Router();

var node1Router = require("../controllers/node1");

// POST request for adding a movie from node1
router.post('./node1/addMovie', node1Router.addMovie);

// POST request for updating a movie from node1
router.post('./node1/:id/updateMovie', node1Router.updateMovie);

// POST request for deleting a movie from node1
router.post('./node1/:id/deleteMovie', node1Router.deleteMovie);

// GET request for searching a movie from node1
// router.get('./node1/searchMovie', node1Router.searchMovie);

module.exports = router;