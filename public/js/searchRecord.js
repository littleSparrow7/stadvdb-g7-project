import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    // hides info and error msg
    $("#info").hide();
    $("#error").hide();

    
    $("#generic-form").submit(function(e) {
        e.preventDefault();
        
        $('#searchTable').empty();
        
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
        
        if (body.rating != "")
            movie.rating = body.rating;

        /**
             * Updates movie to the database
             * @param { Movie } movie without id
             */
        $.get(nodepath + "/searchMovie", movie, function(data){
            if (data.error){
                $("#info").hide();
                $("#error").text("Encountered an error when trying to retrieve the data.");
                $('#error').show();
            }
            else{
                $('#error').hide();
                $('#info').text("Successfully retrieved the data");
                $('#info').show();

                for (var i = 0; i < data.result.length; i++){
                    $('#searchTable').append(`<tr>
                                                <td class="numbers">${data.result[i].id}</td>
                                                <td class="words">${data.result[i].name}</td>
                                                <td class="numbers">${data.result[i].year}</td>
                                                <td class="numbers">${data.result[i].rank}</td>
                                            </tr>`);
                }
                
            }
            
            // TODO
            // search results in in data.result
            // returns as array of RowDataPacket {id: 1, name: '#7 Train: An Immigrant Journey, The', year: 2000, rank: null, nsynced: 0, deleted: 0}
            // but the individual info are still accessible the same way e.g. data.result[0].id => 1
        });
    });
});