import { node1, node2, node3 } from './pools.js';
import * as n1Controller from "./node1.js";
import * as sql from "./nodes.js";

export function addMovie(req, res){
    n1Controller.addMovie(req, res);
    res.send("ADD MOVIE");
}

export function updateMovie(req, res){
    n1Controller.updateMovie(req, res);
    res.send("UPDATE MOVIE");
}

export function deleteMovie(req, res){
    n1Controller.deleteMovie(req, res);
    res.send("DELETE MOVIE")
}

export function searchMovie(req, res){
    //search node 1, node 2, and node 3
    res.send("SEARCH MOVIE")
}