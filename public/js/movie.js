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

        if (this.title != null && this.title != ""){
            cols += ", `name`";
            values += ", '" + this.title.replaceAll("'", "''") + "'";
        }
        
        if (this.year != null && this.year != ""){
            cols += ", `year`";
            values += ", " + this.year;
        }
        
        if (this.rating != null && this.rating != ""){
            cols += ", `rank`";
            values += ", " + this.rating;
        }
        
        if (this.nsynced !== null && this.nsynced !== ""){
            cols += ", `nsynced`";
            values += ", " + this.nsynced;
        }

        if (this.deleted !== null && this.deleted !== ""){
            cols += ", `deleted`";
            values += ", " + this.deleted;
        }
        
        cols += ")";
        values += ")";
        return cols + values;
    }

    get updateString(){
        var arr = [];

        if (this.title !== null && this.title !== ""){
            arr.push("`name`='" + this.title.replaceAll("'", "''") + "'");
        }
        
        if (this.year !== null && this.year !== ""){
            arr.push("`year`=" + this.year);
        }
        
        if (this.rating !==null && this.rating !== ""){
            arr.push("`rank`=" + this.rating);
        }
        

        if (this.nsynced !== null && this.nsynced !== ""){
            arr.push("`nsynced`=" + this.nsynced);
        }

        if (this.deleted !== null && this.deleted !== ""){
            arr.push("`deleted`=" + this.deleted);
        }

        return arr.join(", ");
    }

    get filterString(){
        var arr = [];

        if (this.id !== null && this.id !== ""){
            arr.push("`id`=" + this.id);
        }

        if (this.title !== null && this.title !== ""){
            arr.push("`name` LIKE '%" + this.title.replaceAll("'", "''") + "%'");
        }
        
        if (this.year !== null && this.year !== ""){
            arr.push("`year`=" + this.year);
        }
        
        if (this.rating !== null && this.rating !== ""){
            arr.push("`rank`=" + this.rating);
        }

        arr.push("`deleted`=0");
        
        return arr.join(" AND ");
    }
}

export { Movie as default };