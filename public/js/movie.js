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

    get updateString(){
        var arr = [];

        if (this.title != null){
            arr.push("`name`='" + this.title + "'");
        }
        
        if (this.year != null){
            arr.push("`year`=" + this.year);
        }
        
        if (this.rating != null){
            arr.push("`rank`=" + this.rating);
        }
        
        if (this.nsynced != null){
            arr.push("`nsynced`=" + this.nsynced);
        }

        if (this.deleted != null){
            arr.push("`deleted`=" + this.deleted);
        }

        return arr.join(", ");
    }

    get filterString(){
        var arr = [];

        if (this.id != null){
            arr.push("`id`=" + this.id);
        }

        if (this.title != null){
            arr.push("`name` LIKE '%" + this.title + "%'");
        }
        
        if (this.year != null){
            arr.push("`year`=" + this.year);
        }
        
        if (this.rating != null){
            arr.push("`rank`=" + this.rating);
        }
        
        if (this.nsynced != null){
            arr.push("`nsynced`=" + this.nsynced);
        }

        if (this.deleted != null){
            arr.push("`deleted`=" + this.deleted);
        }

        return arr.join(" AND ");
    }
}

export { Movie as default };