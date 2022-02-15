import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    // hides info and error msg
    $("#info").hide();
    $("#error").hide();

    
    $("#generic-form").submit(function(e) {
        e.preventDefault();

        var body = new Movie(
            $("#inputID4").val(),
            $("#inputTitle4").val(),
            $("#inputYear").val(),
            $("#inputRank").val(),
            null,
            0);
        

        var movie = {};
        movie.deleted = 0;

        if (body.id != "")
            movie.id = body.id;

        if (body.title != "")
            movie.title = body.title;
        
        if (body.year != "")
            movie.year = body.year;
        
        if (body.rank != "")
            movie.rank = body.rank;

        /**
             * Updates movie to the database
             * @param { Movie } movie without id
             */
        $.get(nodepath + "/searchMovie", movie, function(data){
            alert(data.result[0]);
            alert(data.result[0].name);
            // returns as array of RowDataPacket {id: 1, name: '#7 Train: An Immigrant Journey, The', year: 2000, rank: null, nsynced: 0, …}
        });
    });
});