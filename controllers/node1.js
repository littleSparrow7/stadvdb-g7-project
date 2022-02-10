import { node1, node2, node3 } from './pools.js';
import { insertMovie } from "./nodes.js";

export function addMovie(req, res){
    // insertMovie(node1, movie);
    
    //if year < 1980, insert to node 2
    //else, insert to node 3
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("ADD MOVIE");
}

export function updateMovie(req, res){
    //update
    //if year < 1980, update node 2
    //else, update node 3
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("UPDATE MOVIE");
}

export function deleteMovie(req, res){
    //delete
    //if year < 1980, delete from node 2
    //else, delete from node 3
    //check nsynced from other nodes
    //check nsynced from current node
    res.send("DELETE MOVIE")
}

export function searchMovie(req, res){
    //search node 1, node 2, and node 3
    res.send("SEARCH MOVIE")
}