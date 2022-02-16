import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    // hides info and error msg
    $("#info").hide();
    $("#error").hide();
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
            $.post(nodepath + "/addMovie", movie, function(err, { data }){
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
                    $('#info').text("Successfully inserted");
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