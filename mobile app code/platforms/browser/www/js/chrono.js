var start = 0
var end = 0
var diff = 0
var timerID = 0

function chrono(idChrono){
    end = new Date()
    diff = end - start
    diff = new Date(diff)
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
    timerID = setTimeout("chrono('"+idChrono+"')", 10)
}

function chronoStart(idChrono){
    start = new Date()
    chrono(idChrono)
}

function chronoContinue(idChrono){
    start = new Date()-diff
    start = new Date(start)
    chrono(idChrono)
}        

function chronoStop(){
    clearTimeout(timerID)
}

function chronoReset(idChrono){
    Dom.set(idChrono, "00:00:000")
    start = new Date()
}

function chronoStopReset(idChrono){
    clearTimeout(timerID)
    Dom.set(idChrono, "00:00:000")
}

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