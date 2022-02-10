import { node1, node2, node3 } from './pools.js';
import { insertMovie } from "./nodes.js";

export function addMovie(req, res){
    // insertMovie(node1, movie);
    
    //if year > 1980, insert to...
    //else, insert to...
    //unlock
    //sync
    res.send("ADD MOVIE");
}

export function updateMovie(req, res){
    //update
    //if year > 1980, update...
    //else, update...
    //unlock
    //sync
    res.send("UPDATE MOVIE");
}

export function deleteMovie(req, res){
    //delete
    //if year > 1980, delete...
    //else, delete...
    //unlock
    //sync
    res.send("DELETE MOVIE")
}