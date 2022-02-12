import { nodepath } from './user.js';

$(document).ready(function(){
    // hides info and error msg
    $("#info").hide();
    $("#error").hide();
    
    // $('#btn-search-record').click(function(){
    //     var movie = {
    //         id: $("#inputID4").val(),
    //         title: $("#inputTitle4").val(),
    //         year: $("#inputYear").val(),
    //         rank: $("#inputRank").val()
    //     };

    //     //TODO: search movie
    //     /**
    //      * Searches for movie in the database based on the corresponding information.
    //      * Null values are ignored in the search process.
    //      * @param {Movie} movie partially filled movie object
    //      */
    //     $.post(nodepath + "/searchMovie", movie, function(data){
    //         console.log(data);
    //         //update database
    //     });
    // });
});