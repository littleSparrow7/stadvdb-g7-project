import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    // hides info and error msg
    $.get("/recentTen", function(data){
        console.log(data);
        alert(data);
        // search results in in data
        // returns as array of RowDataPacket {id: 1, name: '#7 Train: An Immigrant Journey, The', year: 2000, rank: null, nsynced: 0, deleted: 0}
        // but the individual info are still accessible the same way e.g. data[0].id => 1
    });

    $.get("/topTen", function(data){
        console.log(data);
        alert(data);
        // search results in in data
        // returns as array of RowDataPacket {id: 1, name: '#7 Train: An Immigrant Journey, The', year: 2000, rank: null, nsynced: 0, deleted: 0}
        // but the individual info are still accessible the same way e.g. data[0].id => 1
    });
});