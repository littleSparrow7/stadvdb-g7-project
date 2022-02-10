$(document).ready(function(){
    var movie = null;
    $('#btn-add-record').click(function(){
        //TODO: insert movie
        /**
         * Inserts new movie to the database
         * @param { Movie } movie movie without id
         */
        $.post("/node1/addMovie", movie, function(data){
            console.log(data);
            //add to database
        });
    });
});