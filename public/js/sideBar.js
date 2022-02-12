$(document).ready(function(){

    var selectTag = $(".selectTag").val();

    // removes all highlights
    $(".nav-link").removeClass("active");

    // highlights page selected
    switch(selectTag){
        case "Home":
            $("#nav-home").addClass("active");
            break;
        case "Add":
            $("#nav-add").addClass("active");
            break;
        case "Delete":
            $("#nav-delete").addClass("active");
            break;
        case "Update":
            $("#nav-update").addClass("active");
            break;
        case "Search":
            $("#nav-search").addClass("active");
    }
});