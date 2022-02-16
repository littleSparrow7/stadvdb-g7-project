import { nodepath } from './user.js';
import Movie from './movie.js';

$(document).ready(function(){
    // empties report tables
    $('#topTenRankTable').empty();
    $('#topTenRecentTable').empty();

    $.get("/recentTen", function(data){
        console.log(data);
        // alert(data);

        for (var i = 0; i < data.length; i++){
            $('#topTenRecentTable').append(`<tr>
                                        <td class="numbers">${data[i].id}</td>
                                        <td class="words">${data[i].name}</td>
                                        <td class="numbers">${data[i].year}</td>
                                        <td class="numbers">${data[i].rank}</td>
                                    </tr>`);
        }
        // search results in in data
        // returns as array of RowDataPacket {id: 1, name: '#7 Train: An Immigrant Journey, The', year: 2000, rank: null, nsynced: 0, deleted: 0}
        // but the individual info are still accessible the same way e.g. data[0].id => 1
    });

    $.get("/topTen", function(data){
        console.log(data);
        // alert(data);

        for (var i = 0; i < data.length; i++){
            $('#topTenRankTable').append(`<tr>
                                        <td class="numbers">${data[i].id}</td>
                                        <td class="words">${data[i].name}</td>
                                        <td class="numbers">${data[i].year}</td>
                                        <td class="numbers">${data[i].rank}</td>
                                    </tr>`);
        }
        // search results in in data
        // returns as array of RowDataPacket {id: 1, name: '#7 Train: An Immigrant Journey, The', year: 2000, rank: null, nsynced: 0, deleted: 0}
        // but the individual info are still accessible the same way e.g. data[0].id => 1
    });
});