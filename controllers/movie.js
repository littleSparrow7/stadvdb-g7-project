class Movie {
    constructor(id, title, year, rating, nsynced, deleted){
        this.id = id;
        this.title = title;
        this.year = year;
        this.rating = rating;
        this.nsynced = nsynced;
        this.deleted = deleted;
    }
    
    get queryString(){
        var cols = "movies (`id`";
        var values = " VALUES (" + this.id;

        if (this.title != null){
            cols += ", `name`";
            values += ", '" + this.title + "'";
        }
        
        if (this.year != null){
            cols += ", `year`";
            values += ", " + this.year;
        }
        
        if (this.rating != null){
            cols += ", `rank`";
            values += ", " + this.rating;
        }
        
        if (this.nsynced != null){
            cols += ", `nsynced`";
            values += ", " + this.nsynced;
        }

        if (this.deleted != null){
            cols += ", `deleted`";
            values += ", " + this.deleted;
        }
        
        cols += ")";
        values += ")";
        return cols + values;
    }
}

export { Movie as default };