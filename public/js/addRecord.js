import { insertMovie } from "./user.js";

$(document).ready(function(){
    $('#btn-add-record').click(function(){
        insertMovie(null);
        window.open("https://stackoverflow.com/questions/15153781/open-new-tabwindow-by-clicking-a-link-in-jquery", '_blank');
        alert("YAY")
    });
});