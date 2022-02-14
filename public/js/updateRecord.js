import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    $("#generic-form").submit(function(e) {
        e.preventDefault();

        var movie = new Movie(
            $("#inputID4").val(),
            $("#inputTitle4").val(),
            $("#inputYear").val(),
            $("#inputRank").val(),
            2,
            null);
        
        if (movie.title == "")
            movie.title = null;
        
        if (movie.year == "")
            movie.year = null;
        
        if (movie.rank == "")
            movie.rank = null;

        var isValid = true;
        if (movie.id == "" || movie.id == null){
            isValid = false;
        }

        if (movie.title == null && movie.year == null && movie.rank == null){
            isValid = false;
        }

        if (isValid){
            alert("Valid!");
            /**
             * Updates movie to the database
             * @param { Movie } movie without id
             */
            $.post(nodepath + "/updateMovie", movie)
                .done(function(data){
                    console.log(data);
                    //add to database
                });
        }
        else{
            alert("Not Valid!");
        }
    });
});