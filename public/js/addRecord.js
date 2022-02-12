import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    $("#add-form").submit(function(e) {
        e.preventDefault();

        var movie = new Movie(
            null,
            $("#inputTitle4").val(),
            $("#inputYear").val(),
            $("#inputRank").val(),
            1,
            0);
        
        var isValid = true;
        if (movie.title == "" || movie.title == null){
            isValid = false;
        }

        if (movie.year == "" || movie.year == null){
            isValid = false;
        }

        if (isValid){
            /**
             * Inserts new movie to the database
             * @param { Movie } movie without id
             */
            $.post(nodepath + "/addMovie", movie)
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