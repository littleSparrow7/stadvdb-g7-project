import { node1, node2, node3 } from './pools.js';
import * as sql from "./nodes.js";

export function addMovie(req, res){
    //insert to node1
    //if year < 1980, insert
    //else, insert to node 3
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("ADD MOVIE");
}

export function updateMovie(req, res){
    //if year < 1980, update
    //else, update node 3
    //update node 1
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("UPDATE MOVIE");
}

export function deleteMovie(req, res){
    //if year < 1980, delete
    //else, delete from node 3
    //delete from node1
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("DELETE MOVIE")
}

export function searchMovie(req, res){
    //search node 1, node 2, and node 3
    res.send("SEARCH MOVIE")
}