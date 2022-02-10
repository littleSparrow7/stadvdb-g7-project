class Movie {
    constructor(id, title, year, rating, nsynced){
        this.id = id;
        this.title = title;
        this.year = year;
        this.rating = rating;
        this.nsynced = nsynced;
    }
    
    get valuesString(){
        var values = "VALUES (" + this.id + ", '" + this.title + "', " + this.year + " , " + this.rating + ", " + this.nsynced + ")";
        return values;
    }
}

export { Movie as default };