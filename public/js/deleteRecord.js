import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){    
   // hides info and error msg
    $("#info").hide();
    $("#error").hide();
   
    $("#delete-form").submit(function(e) {
        e.preventDefault();

        var movie = new Movie(
            $("#inputID4").val(),
            null,
            null,
            null,
            null,
            1);

        var isValid = true;
        if (movie.id == "" || movie.id == null){
            isValid = false;
        }

        if (isValid){
            alert("Valid!");
            /**
             * Updates movie to the database
             * @param { Movie } movie without id
             */
            $.post(nodepath + "/deleteMovie", movie)
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