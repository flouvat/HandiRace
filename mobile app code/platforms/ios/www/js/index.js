/* jshint quotmark: false, unused: vars, browser: true */
/* global cordova, console, $, bluetoothSerial, _, refreshButton, deviceList, previewColor, red, green, blue, disconnectButton, connectionScreen, dataScreen, rgbText, messageDiv */
'use strict';

var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        //connectionScreen.hidden = true;
        gameScreen.hidden = true;
        buttons.hidden = true;
        dataScreen.hidden = true;
        optionsScreen.hidden = true;
    },
    deviceready: function() {

        // wire buttons to functions
        deviceList.ontouchstart = app.connect; // assume not scrolling
        refreshButton.ontouchstart = app.list;
        disconnectButton.ontouchstart = app.disconnect;
        
        // add event listeners on options inputs that need to be updated 
        // rayon
        document.getElementById('rayonOptionRange').addEventListener("input", function() {
            document.getElementById('rayonOption').value = document.getElementById('rayonOptionRange').value;
        });
        document.getElementById('rayonOption').addEventListener("input", function() {
            document.getElementById('rayonOptionRange').value = document.getElementById('rayonOption').value;
        });
        // distance
        document.getElementById('distanceOptionRange').addEventListener("input", function() {
            document.getElementById('distanceOption').value = document.getElementById('distanceOptionRange').value;
            document.getElementById('coefDif2Label').innerHTML = "x"+document.getElementById('coefDif2').value+" ("+document.getElementById('distanceOption').value*document.getElementById('coefDif2').value+"m)";
        });
        document.getElementById('distanceOption').addEventListener("input", function() {
            document.getElementById('distanceOptionRange').value = document.getElementById('distanceOption').value;
        });
        // difficulte
        document.getElementById('coefDif1').addEventListener("input", function() {
            document.getElementById('coefDif1Label').innerHTML = "x"+document.getElementById('coefDif1').value;
            document.getElementById('coefDif2').value = 1;
            document.getElementById('coefDif2Label').innerHTML = "x"+document.getElementById('coefDif2').value;
        });
        document.getElementById('coefDif2').addEventListener("input", function() {
            document.getElementById('coefDif2Label').innerHTML = "x"+document.getElementById('coefDif2').value+" ("+document.getElementById('distanceOption').value*document.getElementById('coefDif2').value+"m)";
            document.getElementById('coefDif1').value = 1;
            document.getElementById('coefDif1Label').innerHTML = "x"+document.getElementById('coefDif1').value;
        });

        /*/ add event on screen orientation change                                                       // WIP TODO
        window.screen.addEventListener("orientationchange", function () {
            app.setStatus("Orientation de l'écran: " + screen.orientation.type);
        });
*/

        app.list();
    },
    list: function(event) {
        deviceList.firstChild.innerHTML = "Recherche en cours...";
        app.setStatus("Recherche de périphériques Bluetooth...");
        
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("Erreur de chargement de la liste."));
    },
    connect: function (e) {
        app.setStatus("Connexion en cours...");
        var device = e.target.getAttribute('deviceId');
        console.log("Connexion vers " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);        
    },
    disconnect: function(event) {
        if (event) {
            event.preventDefault();
        }

        app.setStatus("Déconnexion...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    onconnect: function() {
        connectionScreen.hidden = true;
        app.dataScreen();
        app.setStatus("Connecté");
    },
    ondisconnect: function() {
        app.connectionScreen();
        app.setStatus("Déconnecté");
    },
    currentScreen: "data",
    swapScreens: function(button) {
        if(button.id == 'toGame'){
            //screen.orientation.lock('landscape');                               // TODO: find a way to lock screen 
            //ScreenOrientation.lock("landscape-primary");
            app.gameScreen();
            button.id = 'toData';
            button.innerHTML = 'Swap to data';
            app.setStatus("Mode jeu");
        }
        else if(button.id == 'toData'){
            //screen.orientation.lock('portrait');
            //ScreenOrientation.lock("portrait-primary");
            app.dataScreen();
            button.id = 'toGame';
            button.innerHTML = 'Swap to game';
            app.setStatus("Mode données");
        }
    },
    connectionScreen: function(){
        connectionScreen.hidden = false;
        gameScreen.hidden = true;
        buttons.hidden = true;
        dataScreen.hidden = true;
        optionsScreen.hidden = true;
        app.currentScreen = "connection";
    },
    gameScreen: function(){
        gameScreen.hidden = false;
        buttons.hidden = false;
        dataScreen.hidden = true;
        optionsScreen.hidden = true;
        app.currentScreen = "game";
    },
    dataScreen: function(){
        gameScreen.hidden = true;
        buttons.hidden = false;
        dataScreen.hidden = false;
        optionsScreen.hidden = true;
        app.currentScreen = "data";
    },
    options: {
        rayon: document.getElementById('rayonOption').value,
        distance: document.getElementById('distanceOption').value,
        styleTerrain: document.getElementById('styleTerrain').value,
        joueur1nom: document.getElementById('player1Name').value,
        joueur2nom: document.getElementById('player2Name').value,
        joueur1couleur: document.getElementById('couleurJoueur1').value,
        joueur2couleur: document.getElementById('couleurJoueur2').value,
        joueur1difficulte: document.getElementById('coefDif1').value,
        joueur2difficulte: document.getElementById('coefDif2').value
    },
    optionsScreen: function(){
        gameScreen.hidden = true;
        buttons.hidden = true;
        dataScreen.hidden = true;
        optionsScreen.hidden = false;
    },
    quitOptions: function(){
        optionsScreen.hidden = true;
        if(app.currentScreen == "connection"){
            connectionScreen.hidden = false;
        }
        else if(app.currentScreen == "game"){
            gameScreen.hidden = false;
            buttons.hidden = false;
        }
        else if(app.currentScreen == "data"){
            buttons.hidden = false;
            dataScreen.hidden = false;
        }
        else app.setStatus("erreur: currentScreen définie à "+app.currentScreen);
    },
    saveOptions: function(){
        if( parseInt(app.options.rayon = document.getElementById('rayonOption').value) < 0) app.options.rayon = 0.0;
        if( parseInt(app.options.distance = document.getElementById('distanceOption').value) < 0 ) app.options.distance = 0;
        app.options.styleTerrain = document.getElementById('styleTerrain').value;
        /*if ( app.options.styleTerrain == "road" ) document.getElementById('circuit').style.backgroundImage = "url('../ui/images/circuit1.png')";
        else document.getElementById('circuit').style.backgroundImage = "url('../ui/images/circuit2.png')";*/                  // WIP change the circuit image from dataScreen
        app.options.joueur1nom = document.getElementById('player1Name').value;
        app.options.joueur2nom = document.getElementById('player2Name').value;
        app.options.joueur1couleur = document.getElementById('couleurJoueur1').value;
        app.options.joueur2couleur = document.getElementById('couleurJoueur2').value;
        if( parseInt(app.options.joueur1difficulte = document.getElementById('coefDif1').value) < 1) app.options.joueur1difficulte = 1;
        if( parseInt(app.options.joueur2difficulte = document.getElementById('coefDif2').value) < 1) app.options.joueur2difficulte = 1;
        app.cancelOptions();                                                                 // update values in case they do not fit the requirements (min/max)
        app.reloadJSfile('js/game.js');
        app.reloadJSfile('js/app.js');
    },
    cancelOptions: function(){
        document.getElementById('rayonOption').value = app.options.rayon;
        document.getElementById('rayonOptionRange').value = app.options.rayon;
        document.getElementById('distanceOption').value = app.options.distance;
        document.getElementById('distanceOptionRange').value = app.options.distance;
        document.getElementById('styleTerrain').value = app.options.styleTerrain;
        document.getElementById('player1Name').value = app.options.joueur1nom;
        if( (document.getElementById('racer1Name').innerHTML = app.options.joueur1nom) == "" ) document.getElementById('racer1Name').innerHTML = "Joueur 1";
        document.getElementById('player2Name').value = app.options.joueur2nom;
        if( (document.getElementById('racer2Name').innerHTML = app.options.joueur2nom) == "" ) document.getElementById('racer2Name').innerHTML = "Joueur 2";
        document.getElementById('couleurJoueur1').value = app.options.joueur1couleur;
        document.getElementById('couleurJoueur2').value = app.options.joueur2couleur;
        document.getElementById('coefDif1').value = app.options.joueur1difficulte;
        document.getElementById('coefDif2').value = app.options.joueur2difficulte;
        document.getElementById('coefDif1Label').innerHTML = "x"+app.options.joueur1difficulte;
        document.getElementById('coefDif2Label').innerHTML = "x"+app.options.joueur2difficulte;
        app.quitOptions();
    },
    reloadJSfile: function(fileName){
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = fileName;
        head.appendChild(script);
    },
    sendToArduino: function(c) {
        bluetoothSerial.write("c" + c + "\n");
    },
    timeoutId: 0,
    setStatus: function(status) {
        if (app.timeoutId) {
            clearTimeout(app.timeoutId);
        }
        messageDiv.innerText = status;
        app.timeoutId = setTimeout(function() { messageDiv.innerText = ""; }, 4000);
    },
    ondevicelist: function(devices) {
        var listItem, deviceId;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");
        
        devices.forEach(function(device) {
            listItem = document.createElement('li');
            listItem.className = "topcoat-list__item";
            if (device.hasOwnProperty("uuid")) { // TODO https://github.com/don/BluetoothSerial/issues/5
                deviceId = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                deviceId = device.address;
            } else {
                deviceId = "ERROR " + JSON.stringify(device);
            }
            listItem.setAttribute('deviceId', device.address);            
            listItem.innerHTML = device.name + "<br/><i>" + deviceId + "</i>";
            deviceList.appendChild(listItem);
        });

        if (devices.length === 0) {
            
            if (cordova.platformId === "ios") { // BLE
                app.setStatus("Aucun périphérique Bluetooth détecté");
            } else { // Android
                app.setStatus("Veuillez connecter un appareil");
            }

        } else {
            app.setStatus(devices.length + " appareil" + (devices.length === 1 ? "" : "s") + " trouvé" + (devices.length === 1 ? "" : "s"));
        }
    },
    generateFailureFunction: function(message) {
        var func = function(reason) {
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    }
};