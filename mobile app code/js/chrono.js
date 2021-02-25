var start = 0
var end = 0
var diff = 0
var timerID = 0

/**
* chrono(idChrono) est une fonction qui permet à partir
* d'une instance chrono placé en paramètre de mettre à jour
* sa valeur
*/
function chrono(idChrono){
    end = new Date()        // |
    diff = end - start      // | calcule du temps passé
    diff = new Date(diff)   // |
    var msec = diff.getMilliseconds() // |
    var sec = diff.getSeconds()       // | Mise à jour de la valeur du chorno
    var min = diff.getMinutes()       // |
    if (min < 10){              // |
        min = "0" + min         // | min sous le format xx
    }                           // |
    if (sec < 10){              // |
        sec = "0" + sec         // | sec sous le format xx
    }                           // |
    if(msec < 10){              // |
        msec = "00" +msec       // |
    }                           // |msec sous le format xxx
    else if(msec < 100){        // |
        msec = "0" +msec        // |
    }
    Dom.set(idChrono, min + ":" + sec + ":" + msec) // | format xx:xx:xxx
    timerID = setTimeout("chrono('"+idChrono+"')", 10)
}

/**
* chronoStart(idChrono) est une fonction qui permet à partir
* d'une instance chrono placé en paramètre de démarer un chrono
*/
function chronoStart(idChrono){
    start = new Date() // Démare le chrono
    chrono(idChrono)   // Lance la fonction chrono
}

/**
* chronoContinue(idChrono) est une fonction qui permet à partir
* d'une instance chrono placé en paramètre de retrouver la nouvelle valeur du chrono
*/
function chronoContinue(idChrono){
    start = new Date()-diff // |
    start = new Date(start) // | Retrouve la nouvelle valeur du chrono
    chrono(idChrono)        // Lance la fonction chrono
}        

/**
* chronoStop() est une fonction qui permet de libérer la mémoire
* des timers
*/
function chronoStop(){
    clearTimeout(timerID) // libère la mémoire
}

/**
* chronoReset(idChrono) est une fonction qui permet à partir
* d'une instance chrono placé en paramètre d'être remise à zéro
*/
function chronoReset(idChrono){
    Dom.set(idChrono, "00:00:000") // met le chrono à zéro ("00:00:000")
    start = new Date()             // relance le chrono
}

/**
* chronoReset(idChrono) est une fonction qui permet à partir
* d'une instance chrono placé en paramètre d'être remise à zéro
* et d'être arréter
*/
function chronoStopReset(idChrono){
    clearTimeout(timerID)               // libère la mémoire timer
    Dom.set(idChrono, "00:00:000")      // met le chrono à zéro ("00:00:000")
}

/**
* chronoGet(idChrono) est une fonction qui permet à partir
* d'une instance chrono placé en paramètre d'afficher sa valeur
* (voir la fonction chrono pour plus de détails)
*/
function chronoGet(idChrono){
    var msec = diff.getMilliseconds()
    var sec = diff.getSeconds()
    var min = diff.getMinutes()
    if (min < 10){
        min = "0" + min
    }
    if (sec < 10){
        sec = "0" + sec
    }
    if(msec < 10){
        msec = "00" +msec
    }
    else if(msec < 100){
        msec = "0" +msec
    }
    Dom.set(idChrono, min + ":" + sec + ":" + msec)
}