import { nodepath } from './user.js';

$(document).ready(function(){
    $('#btn-add-record').click(function(){
        var movie = {
            title: $("#inputTitle4").val(),
            year: $("#inputYear").val(),
            rank: $("#inputRank").val(),
            nsynced: 0,
            deleted: 0
        };

        //TODO: check if movie is valid
        //TODO: insert movie
        /**
         * Inserts new movie to the database
         * @param { Movie } movie without id
         */
        $.post(nodepath + "/addMovie", movie, function(data){
            console.log(data);
            //add to database
        });
    });
});