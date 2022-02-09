const user = require("./user.js");

$(document).ready(function(){
    $('#btn-add-record').click(function(){
        user.insertMovie(null);
        $("#inputTitle4").text("");
        alert("INSERT MOVIE");
    });
});