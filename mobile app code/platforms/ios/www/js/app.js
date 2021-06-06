//window.addEventListener("DOMContentLoaded", (event) => {

    var signal1 = 28;
    var signal2 = 252;
    var startTime1 = new Date();
    var startTime2 = new Date();
    var delaiRebonds = 135;                         // en ms
    var toggleGetInfos = false;
    var toggleGetChrono1 = true;
    var toggleGetChrono2 = true;
    var rayon;                                      // en mm
    var distanceTotale;                             // en m
    var distanceParcourue1 = 0;                     // en m
    var distanceParcourue2 = 0;                     // en m
    var progression1 = 0;                           // en %
    var progression2 = 0;                           // en %
    var speed1 = 0;                                 // en km/h
    var speed2 = 0;                                 // en km/h
    var topspeed1 = 0;                              // en km/h
    var topspeed2 = 0;                              // en km/h
    var difficulte1;
    var difficulte2;
    var intervalID = 0;
    var counter1 = 0;
    var counter2 = 0;
    var frequence = 500;
    var player1;
    var player2;
    var gagnant = "";

    rayon = app.options.rayon;
    distanceTotale = app.options.distance;
    if( (player1 = app.options.joueur1nom) == "" ) player1 = "joueur 1";
    if( (player2 = app.options.joueur2nom) == "" ) player2 = "joueur 2";
    difficulte1 = app.options.joueur1difficulte;
    difficulte2 = app.options.joueur2difficulte;

    app.canGetInfos = function(){
        if(!toggleGetInfos){
            toggleGetInfos = true;
            Dom.get('optionsMenu').style.display = "none";
            Dom.get('disconnectButton').style.display = "none";
            Dom.set('getInfos', "Arreter");
            Dom.get('getInfos').className = "red wide";
            chronoStart('chronotime');
            app.startGetInfos();
        }
        else{
            bluetoothSerial.unsubscribeRawData();
            chronoStopReset('chronotime');
            app.resetData();
        }
    }

    app.startGetInfos = function(){
        bluetoothSerial.subscribeRawData(function(textGotten){
            if(toggleGetInfos){     

                var str = new Uint8Array(textGotten);

                delta1 = distanceParcourue1;
                delta2 = distanceParcourue2;

                if(str[0] == signal1){
                    var endTime1 = new Date();
                    var diff1 = endTime1 - startTime1;
                    startTime1 = endTime1;

                    if(distanceParcourue1 < distanceTotale*difficulte1){
                        if(diff1 > delaiRebonds){
                            distanceParcourue1+=2*Math.PI*rayon*Math.pow(10, -3); 
                            speed1 = (distanceParcourue1-delta1)*1000/diff1*3.6;
                            if(topspeed1 < speed1) topspeed1 = speed1;
                            if(distanceParcourue1 > distanceTotale*difficulte1) distanceParcourue1 = distanceTotale*difficulte1;
                        }
                    }
                    else if(toggleGetChrono1){
                        chronoGet("chrono1");
                        toggleGetChrono1 = false;
                        if(toggleGetChrono2) gagnant = player1;
                    }
                    counter1++;
                }
                else if(str[0] == signal2){
                    var endTime2 = new Date();
                    var diff2 = endTime2 - startTime2;
                    startTime2 = endTime2;

                    if(distanceParcourue2 < distanceTotale*difficulte2){
                        if(diff2 > delaiRebonds){
                            distanceParcourue2+=2*Math.PI*rayon*Math.pow(10, -3); 
                            speed2 = (distanceParcourue2-delta2)*1000/diff2*3.6;
                            if(topspeed2 < speed2) topspeed2 = speed2;
                            if(distanceParcourue2 > distanceTotale*difficulte2) distanceParcourue2 = distanceTotale*difficulte2;
                        }
                    }
                    else if(toggleGetChrono2){
                        chronoGet("chrono2");
                        toggleGetChrono2 = false;
                        if(toggleGetChrono1) gagnant = player2;
                    }
                    counter2++;
                }
                
                progression1 = (distanceParcourue1*100/distanceTotale)/difficulte1;
                progression2 = (distanceParcourue2*100/distanceTotale)/difficulte2;

                
                Dom.get('grad1pic').style.top = 200 - 1.7*progression1 + "px";
                Dom.get('grad1').getElementsByClassName("bar")[0].style.height = progression1 + "%";
                Dom.get('grad1').getElementsByClassName("status")[0].textContent = Math.floor(progression1) + "%";

                Dom.set('vitesse1', Math.round(speed1*100)/100 + " km/h");
                Dom.set('distance1', Math.floor(distanceParcourue1) + " m");
                Dom.set('vmax1', Math.round(topspeed1*100)/100 + " km/h");


                Dom.get('grad2pic').style.top = 200 - 1.7*progression2 + "px";
                Dom.get('grad2').getElementsByClassName("bar")[0].style.height = progression2 + "%";
                Dom.get('grad2').getElementsByClassName("status")[0].textContent = Math.floor(progression2) + "%";

                Dom.set('vitesse2', Math.round(speed2*100)/100 + " km/h");
                Dom.set('distance2', Math.floor(distanceParcourue2) + " m");
                Dom.set('vmax2', Math.round(topspeed2*100)/100 + " km/h");
                

                if(!toggleGetChrono1 && !toggleGetChrono2){
                    chronoStop();
                    Dom.set('chronotime', "Victoire de " + gagnant + " !");
                    Dom.set('displayW1', "Victoire de " + gagnant + " !");
                    Dom.set('displayW2', "Victoire de " + gagnant + " !");

                    Dom.get('displayW1').style.fontSize = 7-(gagnant.length/10) + "vw";
                    Dom.get('displayW2').style.fontSize = 7-(gagnant.length/10) + "vw";
                }
            }
        });
                                                            //TODO: update speed values every (frequence/1000) seconds
        intervalID = setInterval(function() {
            var speedtemp1, speedtemp2;
            //if(distanceParcourue1 < distanceTotale){
                if((speedtemp1 = counter1*2*Math.PI*rayon*Math.pow(10, -3)/(frequence/1000)*3.6) <= speed1) speed1 = speedtemp1;
                Dom.set('vitesse1', Math.round(speed1*100)/100 + " km/h");
                counter1 = 0;
            //}
            //else speed1 = 0;

            //if(distanceParcourue2 < distanceTotale){
                if((speedtemp2 = counter2*2*Math.PI*rayon*Math.pow(10, -3)/(frequence/1000)*3.6) <= speed2) speed2 = speedtemp2;
                Dom.set('vitesse2', Math.round(speed2*100)/100 + " km/h");
                counter2 = 0;
            //}
            //else speed2 = 0;
        }, frequence);
        

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
        speed1 = 0;
        speed2 = 0;
        topspeed1 = 0;
        topspeed2 = 0;
        Dom.get('grad1pic').style.top = 200 + "px";
        Dom.get('grad2pic').style.top = 200 + "px";
        Dom.get('grad1').getElementsByClassName("bar")[0].style.height = progression1 + "%";
        Dom.get('grad1').getElementsByClassName("status")[0].textContent = Math.floor(progression1) + "%";
        Dom.get('grad2').getElementsByClassName("bar")[0].style.height = progression2 + "%";
        Dom.get('grad2').getElementsByClassName("status")[0].textContent = Math.floor(progression2) + "%";
        toggleGetChrono1 = true;
        toggleGetChrono2 = true;
        
        Player1.position = 0;
        Player2.position = 0;
        Player1.topspeed = 0;
        Player2.topspeed = 0;
        Dom.set('distancePlayer1', Player1.position);
        Dom.set('distancePlayer2', Player2.position);
        Dom.set('topspeedPlayer1', Player1.topspeed);
        Dom.set('topspeedPlayer2', Player2.topspeed);

        window.clearInterval(intervalID);
        /*-------------Clear all Timeouts-----------------
        var id = window.setTimeout(function() {}, 0);
        while (id--) {
            window.clearTimeout(id); 
        }
        -------------------------------------------------*/
    }

//});