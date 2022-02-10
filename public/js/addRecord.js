// import { insertMovie } from "./user.js";

$(document).ready(function(){
    var movie = null;
    $('#btn-add-record').click(function(){
        $.post("/node1/addMovie", movie, function(data){
            console.log(data);
        });
        alert("YAY");
    });
});