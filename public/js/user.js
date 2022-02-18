export var NODE = 1;
export var nodepath = '/node' + NODE;
export var uncommittedMovies = [];
export var isSyncing = false;
var isUpdating = false;

export function checkUpdating(){
    return isUpdating;
}

export function setUpdating(){
    isUpdating = true;
}

export function setNotUpdating(){
    isUpdating = false;
}
