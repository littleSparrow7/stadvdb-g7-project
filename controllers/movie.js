class Movie {
    constructor(id, title, year, rating, nsynced, deleted){
        this.id = id;
        this.title = title;
        this.year = year;
        this.rating = rating;
        this.nsynced = nsynced;
        this.deleted = deleted;
    }
    
    get valuesString(){
        var values = "VALUES (" + this.id + ", '" + this.title + "', " + this.year + " , " + this.rating + ", " + this.nsynced +  ", " + this.deleted + ")";
        return values;
    }
}

export { Movie as default };