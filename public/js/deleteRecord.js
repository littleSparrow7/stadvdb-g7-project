import { nodepath } from './user.js';

$(document).ready(function(){    
    
    $('#btn-delete-record').click(function(){
        var id = $("#inputID4").val();
        
        //TODO: delete movie
        /**
         * Marks movie as deleted
         * @param { number } id of movie to be deleted
         */
        $.post(nodepath + "/deleteMovie", id, function(data){
            console.log(data);
            //delete database
        });
        
    });
});