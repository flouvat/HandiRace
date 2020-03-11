var toggleGetInfos = false;
var toggleGetChrono1 = true;
var toggleGetChrono2 = true;
var rayon;                                      // en mm
var distanceTotale;                             // en m
var distanceParcourue1 = 0;                     // en m
var distanceParcourue2 = 0;                     // en m
var progression1 = 0;                           // en %
var progression2 = 0;                           // en %
var vitesse1 = 0;                               // en km/h
var vitesse2 = 0;                               // en km/h
var vitesseMax1 = 0;                            // en km/h
var vitesseMax2 = 0;                            // en km/h
var difficulte1;
var difficulte2;
var intervalID = 0;
var timeOutID = 0;
var compteur1 = 0;
var compteur2 = 0;
var frequenceUpdateVitesse = 500;               // en ms
var joueur1;
var joueur2;
var gagnant = "";
var timerCountdown = 5;
var persistenceCountDown = 2;

// load variables from app.options
rayon = app.options.rayon;
distanceTotale = app.options.distance;
if( (joueur1 = app.options.joueur1nom) == "" ) joueur1 = "joueur 1";
if( (joueur2 = app.options.joueur2nom) == "" ) joueur2 = "joueur 2";
difficulte1 = app.options.joueur1difficulte;
difficulte2 = app.options.joueur2difficulte;


app.canGetInfos = function(){
    if(!toggleGetInfos){
        toggleGetInfos = true;
        Dom.get('optionsMenu').style.display = "none";              // hide optionsMenu and disconnectButton so they can't get used during the race
        Dom.get('disconnectButton').style.display = "none";
        Dom.set('getInfos', "Arreter");                             // turn getInfos button from a starter to an ender 
        Dom.get('getInfos').className = "red wide";
        app.countDown(timerCountdown, persistenceCountDown);        // start countdown to get ready for the race
        //app.pretpartez(timerCountdown, persistenceCountDown);
        timeOutID = setTimeout(function() {                         // starts the race at the end of countdown
            window.clearInterval(intervalID);
            chronoStart('chronotime');
            app.startGetInfos();                                    // start collecting and processing all bluetooth flow
        }, timerCountdown*1000);                                        
    }
    else{
        window.clearTimeout(timeOutID);        
        window.clearInterval(intervalID);
        bluetoothSerial.unsubscribe();                              // stop collecting and processing all bluetooth flow
        chronoStopReset('chronotime');
        app.resetData();                                            // reset all variables and all screen displays accordingly
    }
}

app.startGetInfos = function(){
    bluetoothSerial.read();     // clear buffer before game starts
    bluetoothSerial.subscribe(';',function(textGotten){
        if(toggleGetInfos){     // make sure we want to get infos 

            var capteur = textGotten[0];                                // extract the sensor id from the data received (1 or 2)
            var time = textGotten.split(":")[1].split(";")[0];          // extract time from the data received (in ms)

            ancienneDistanceParcourue1 = distanceParcourue1;
            ancienneDistanceParcourue2 = distanceParcourue2;

            if(capteur == 1){
                if(distanceParcourue1 < distanceTotale*difficulte1){
                        distanceParcourue1+=2*Math.PI*rayon*Math.pow(10, -3); 
                        vitesse1 = (distanceParcourue1-ancienneDistanceParcourue1)*1000/time*3.6;
                        if(vitesseMax1 < vitesse1) vitesseMax1 = vitesse1;
                        if(distanceParcourue1 > distanceTotale*difficulte1) distanceParcourue1 = distanceTotale*difficulte1;
                }
                else if(toggleGetChrono1){                  // if player1 is at the finish line and chrono was still running
                    chronoGet("chrono1");                       // freeze chrono
                    toggleGetChrono1 = false;                   // turn boolean to false to indicate chrono has been frozen/player is at finish line
                    if(toggleGetChrono2) gagnant = joueur1;     // if player2's chrono is still running, player1 is the winner
                }
                compteur1++;                                // increments on each sensor detection for reedOne
            }
            else if(capteur == 2){
                if(distanceParcourue2 < distanceTotale*difficulte2){
                        distanceParcourue2+=2*Math.PI*rayon*Math.pow(10, -3);
                        vitesse2 = (distanceParcourue2-ancienneDistanceParcourue2)*1000/time*3.6;
                        if(vitesseMax2 < vitesse2) vitesseMax2 = vitesse2;
                        if(distanceParcourue2 > distanceTotale*difficulte2) distanceParcourue2 = distanceTotale*difficulte2;
                }
                else if(toggleGetChrono2){                  // if player2 is at the finish line and chrono was still running
                    chronoGet("chrono2");                       // freeze chrono
                    toggleGetChrono2 = false;                   // turn boolean to false to indicate chrono has been frozen/player is at finish line
                    if(toggleGetChrono1) gagnant = joueur2;     // if player1's chrono is still running, player2 is the winner
                }
                compteur2++;                                // increments on each sensor detection for reedTwo
            }
            
            // increments progressions from 0% to 100% based on distance travelled by each player
            progression1 = (distanceParcourue1*100/distanceTotale)/difficulte1;
            progression2 = (distanceParcourue2*100/distanceTotale)/difficulte2;

            // updates all displays for player1
            Dom.get('grad1pic').style.top = 200 - 1.7*progression1 + "px";
            Dom.get('grad1').getElementsByClassName("bar")[0].style.height = progression1 + "%";
            Dom.get('grad1').getElementsByClassName("status")[0].textContent = Math.floor(progression1) + "%";

            Dom.set('vitesse1', Math.round(vitesse1*100)/100 + " km/h");
            Dom.set('distance1', Math.floor(distanceParcourue1) + " m");
            Dom.set('vmax1', Math.round(vitesseMax1*100)/100 + " km/h");

            // updates all displays for player2
            Dom.get('grad2pic').style.top = 200 - 1.7*progression2 + "px";
            Dom.get('grad2').getElementsByClassName("bar")[0].style.height = progression2 + "%";
            Dom.get('grad2').getElementsByClassName("status")[0].textContent = Math.floor(progression2) + "%";

            Dom.set('vitesse2', Math.round(vitesse2*100)/100 + " km/h");
            Dom.set('distance2', Math.floor(distanceParcourue2) + " m");
            Dom.set('vmax2', Math.round(vitesseMax2*100)/100 + " km/h");
            
            // when both players reach the end or if one player reached the end before the other one did 10% of the race
            if(!toggleGetChrono1 && !toggleGetChrono2 || !toggleGetChrono1 && progression2 < 10 || !toggleGetChrono2 && progression1 < 10){
                chronoStop();
                Dom.set('chronotime', "Victoire de " + gagnant + " !");
                Dom.set('displayW1', "Victoire de " + gagnant + " !");
                Dom.set('displayW2', "Victoire de " + gagnant + " !");

                Dom.get('displayW1').style.fontSize = 7-(gagnant.length/10) + "vw";
                Dom.get('displayW2').style.fontSize = 7-(gagnant.length/10) + "vw";
            }
        }
    });

    // update speed values even if sensors don't detect anything in case wheels are stopped or take too much time to do a revolution
    intervalID = setInterval(function() {
        var vitesseTemp1, vitesseTemp2;
            if((vitesseTemp1 = compteur1*2*Math.PI*rayon*Math.pow(10, -3)/(frequenceUpdateVitesse/1000)*3.6) <= vitesse1) vitesse1 = vitesseTemp1;
            Dom.set('vitesse1', Math.round(vitesse1*100)/100 + " km/h");
            compteur1 = 0;

            if((vitesseTemp2 = compteur2*2*Math.PI*rayon*Math.pow(10, -3)/(frequenceUpdateVitesse/1000)*3.6) <= vitesse2) vitesse2 = vitesseTemp2;
            Dom.set('vitesse2', Math.round(vitesse2*100)/100 + " km/h");
            compteur2 = 0;
    }, frequenceUpdateVitesse);

}

app.resetData = function(){
    toggleGetInfos = false;
    Dom.get('optionsMenu').style.display = "inline-block";
    Dom.get('disconnectButton').style.display = "inline-block";
    Dom.set('chrono1', "&nbsp;");
    Dom.set('chrono2', "&nbsp;");
    Dom.set('getInfos', "Demarrer");
    Dom.get('getInfos').className = "green wide";
    Dom.set('vitesse1', "-");
    Dom.set('distance1', "-");
    Dom.set('vmax1', "-");
    Dom.set('vitesse2', "-");
    Dom.set('distance2', "-");
    Dom.set('vmax2', "-");
    distanceParcourue1 = 0;
    distanceParcourue2 = 0;
    progression1 = 0;
    progression2 = 0;
    vitesse1 = 0;
    vitesse2 = 0;
    vitesseMax1 = 0;
    vitesseMax2 = 0;
    Dom.get('grad1pic').style.top = 200 + "px";
    Dom.get('grad2pic').style.top = 200 + "px";
    Dom.get('grad1').getElementsByClassName("bar")[0].style.height = progression1 + "%";
    Dom.get('grad1').getElementsByClassName("status")[0].textContent = Math.floor(progression1) + "%";
    Dom.get('grad2').getElementsByClassName("bar")[0].style.height = progression2 + "%";
    Dom.get('grad2').getElementsByClassName("status")[0].textContent = Math.floor(progression2) + "%";
    toggleGetChrono1 = true;
    toggleGetChrono2 = true;
    
    // reset of some of the game variables/displays needed here
    Player1.hasFinished = false;
    Player2.hasFinished = false;
    Player1.position = 0;
    Player2.position = 0;
    Player1.topspeed = 0;
    Player2.topspeed = 0;
    Dom.set('displayW1', "");
    Dom.set('displayW2', "");
    Dom.set('distancePlayer1', Player1.position);
    Dom.set('distancePlayer2', Player2.position);
    Dom.set('topspeedPlayer1', Player1.topspeed);
    Dom.set('topspeedPlayer2', Player2.topspeed);

    window.clearInterval(intervalID);
}

app.countDown = function(timer, persistence){
    
    var countDownDate = new Date(Date.parse(new Date()) + timer * 1000).getTime();          // sets timer time

    intervalID = setInterval(function() {

        var deltaTime = countDownDate - new Date().getTime();                               // time left on clock
        var countDownTime = Math.ceil(deltaTime/1000);                                      // ceil time left for a better feeling

        if(deltaTime > 0){
            Dom.set('chronotime', countDownTime);                            // displays time left for everyone
            Dom.set('displayW1', countDownTime);
            Dom.set('displayW2', countDownTime);
        }          
        else{
            Dom.set('displayW1', "C'EST PARTI !");                                          // LET'S GO prompt for game
            Dom.set('displayW2', "C'EST PARTI !");
            var timeOutCountDown = setTimeout(function(){                                   // clear the LET'S GO prompt after some time
                Dom.set('displayW1', "");
                Dom.set('displayW2', "");
                window.clearTimeout(timeOutCountDown);
            }, persistence*1000);
        }
    });
}

app.pretpartez = function(timer, persistence){
    var countDownDate = new Date(Date.parse(new Date()) + timer * 1000).getTime();          // sets timer time

    intervalID = setInterval(function() {

        var deltaTime = countDownDate - new Date().getTime();                               // time left on clock

        if(deltaTime > (timer*1000)/2){
            Dom.set('chronotime', "À vos marques..");
            Dom.set('displayW1', "À vos marques..");
            Dom.set('displayW2', "À vos marques..");
        }
        else if(deltaTime > 0){
            Dom.set('chronotime', "Prêts ?");
            Dom.set('displayW1', "Prêts ?");
            Dom.set('displayW2', "Prêts ?");
        }       
        else{
            Dom.set('chronotime', "PARTEZ !");
            Dom.set('displayW1', "PARTEZ !");
            Dom.set('displayW2', "PARTEZ !");
            var timeOutCountDown = setTimeout(function(){                                   // clear the LET'S GO prompt after some time
                Dom.set('displayW1', "");
                Dom.set('displayW2', "");
                window.clearTimeout(timeOutCountDown);
            }, persistence*1000);
        }
    });
}

