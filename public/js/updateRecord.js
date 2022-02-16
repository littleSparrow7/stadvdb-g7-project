import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    // hides info and error msg
    $("#info").hide();
    $("#error").hide();

    $("#generic-form").submit(function(e) {
        e.preventDefault();

        $('#info').text("Updating movie record...please wait");
        $('#info').show();

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
        
        if (movie.rating == "")
            movie.rating = null;

        var isValid = true;
        if (movie.id == "" || movie.id == null){
            isValid = false;
        }

        if (movie.title == null && movie.year == null && movie.rating == null){
            isValid = false;
        }

        if (isValid){
            /**
             * Updates movie to the database
             * @param { Movie } movie without id
             */
            $.post(nodepath + "/updateMovie", movie, function(data){
                if (!data.node1.connected){
                    $("#info").hide();
                    $('#error').text("Failed to connect to database");
                    $('#error').show();
                }
                else if (!data.node1.locked){
                    $("#info").hide();
                    $('#error').text("Failed to acquire lock");
                    $('#error').show();
                }
                else if (!data.node1.inserted){
                    $("#info").hide();
                    $('#error').text("Failed to insert to database");
                    $('#error').show();
                }
                else{
                    $('#error').hide();
                    $('#info').text("Record successfully updated");
                    $('#info').show();
                }
            });
        }
        else{
            $("#info").hide();
            $("#error").text("Invalid input! Please check that you have inputted the correct details");
            $('#error').show();
        }
    });
});