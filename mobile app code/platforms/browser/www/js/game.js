//window.addEventListener("DOMContentLoaded", (event) => {

    var fps             = 60;                           // how many 'update' frames per second
    var step            = 1/fps;                        // how long is each frame (in seconds)
    var width           = 1024;                         // logical canvas width
    var height          = 768;                          // logical canvas height
    var canvas1         = Dom.get('canvas1');           // our canvas1...
    var context1        = canvas1.getContext('2d');     // ...and its drawing context
    var canvas2         = Dom.get('canvas2');           // our canvas2...
    var context2        = canvas2.getContext('2d');     // ...and its drawing context
    var background      = null;                         // our background image (loaded below)
    var sprites         = null;                         // our spritesheet (loaded below)
    var resolution      = null;                         // scaling factor to provide resolution independence (computed)
    var roadWidth       = 2000;                         // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    var segmentLength   = 100;                          // length of a single segment
    var rumbleLength    = 3;                            // number of segments per red/white rumble strip
    var trackLength     = null;                         // z length of entire track (computed)
    var finishLineDist  = app.options.distance;         // distance between start and finish line (in meters)
    var nbOfSegments    =                               // number of segments between start and finish line (3.64/m or 3640/km)
        Math.round(3.64*finishLineDist);
    var lanes           = 2;                            // number of lanes
    var fieldOfView     = 100;                          // angle (degrees) for field of view
    var cameraHeight    = 1000;                         // z height of camera
    var cameraDepth     = null;                         // z distance camera is from screen (computed)
    var drawDistance    = 300;                          // number of segments to draw
    var fogDensity      = 5;                            // exponential fog density
    var maxSpeed        = segmentLength/step;           // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
    var roadStyle       =                               // if set to false, will display a 400m running track style
        app.options.styleTerrain == "road";

    var Player1 = {                                     // variables relative to Player1
        X: -0.5,                                        // Player1 x offset from center of road (-1 to 1 to stay independent of roadWidth)
        Z: null,                                        // Player1 relative z distance from camera (computed)
        position: 0,                                    // current camera Z position for Player1 (add Player1.Z to get Player1's absolute Z position)
        speed: 0,                                       // current Player1's speed
        topspeed: 0,                                    // Player1's top speed
        segments: [],                                   // array of road segments for Player1
        renderedColor: app.options.joueur1couleur,      // color of the rendered car for Player1 (default is RED)
        renderingStraight: null,
        renderingLeft: null,
        renderingRight: null,
        malus: app.options.joueur1difficulte,           // multiply the distance Player1 has to travel to reach the finish line
        hasFinished: false,                             // boolean marker to tell whether or not Player1 crossed the line
        delta: 0
    }

    var Player2 = {                                     // variables relative to Player2
        X: 0.5,                                         // Player2 x offset from center of road (-1 to 1 to stay independent of roadWidth)
        Z: null,                                        // Player2 relative z distance from camera (computed)
        position: 0,                                    // current camera Z position for Player2 (add Player2.Z to get Player2's absolute Z position)
        speed: 0,                                       // current Player2's speed
        topspeed: 0,                                    // Player2's top speed
        segments: [],                                   // array of road segments for 
        renderedColor: app.options.joueur2couleur,      // color of the rendered car for Player2 (default is RED)
        renderingStraight: null,
        renderingLeft: null,
        renderingRight: null,
        malus: app.options.joueur2difficulte,           // multiply the distance Player2 has to travel to reach the finish line
        hasFinished: false,                             // boolean marker to tell whether or not Player2 crossed the line
        delta: 0
    }

    var smoothingDelay = 2,                             // number of steps needed before an update of a Player's position
        resetDelay = smoothingDelay;


    //=========================================================================
    //                        UPDATE THE GAME WORLD
    //=========================================================================

    function update(dt) {
        
        smoothingDelay--;

        if(isNaN(parseInt(Dom.get('distance1').innerHTML))) Player1.delta = 0;
        else Player1.delta = (parseInt(Dom.get('distance1').innerHTML)*nbOfSegments/finishLineDist*100)/Player1.malus - Player1.position;

        if(isNaN(parseInt(Dom.get('distance2').innerHTML))) Player2.delta = 0; 
        else Player2.delta = (parseInt(Dom.get('distance2').innerHTML)*nbOfSegments/finishLineDist*100)/Player2.malus - Player2.position;
        
                        
        //else Player2.delta = Math.round(Player2.position/nbOfSegments*finishLineDist/100) - parseInt(Dom.get('distance2').innerHTML);

        //Player1.delta = Math.round(Player1.position/nbOfSegments*finishLineDist/100) - parseInt(Dom.get('distance1').innerHTML),
        //Player2.delta = Math.round(Player2.position/nbOfSegments*finishLineDist/100) - parseInt(Dom.get('distance2').innerHTML);
        
        if( smoothingDelay <= 0 ){
            if( Player1.delta > 0 )
                if( (Player1.position = Util.increase(Player1.position, Player1.delta*(segmentLength/1000), trackLength)) > nbOfSegments*segmentLength -1 ) Player1.hasFinished = true;
            if( Player2.delta > 0 )
                if( (Player2.position = Util.increase(Player2.position, Player2.delta*(segmentLength/1000), trackLength)) > nbOfSegments*segmentLength -1 ) Player2.hasFinished = true;
            smoothingDelay = resetDelay;
        }
        
        
        
        /*                                                                                                                                                      //increment based only on Player.speed
        if( (Player1.position = Util.increase(Player1.position, dt * Player1.speed, trackLength)) >= nbOfSegments*segmentLength ) Player1.hasFinished = true;
        if( (Player2.position = Util.increase(Player2.position, dt * Player2.speed, trackLength)) >= nbOfSegments*segmentLength ) Player2.hasFinished = true;
        


        //var dx1 = dt * 2 * (Player1.speed/maxSpeed); // at top Player1.speed, should be able to cross from left to right (-1 to 1) in 1 second
        //var dx2 = dt * 2 * (Player2.speed/maxSpeed); // at top Player2.speed, should be able to cross from left to right (-1 to 1) in 1 second

    /*                                                        WE DO NOT NEED TO TURN YET BUT IT'S THERE, JUST IN CASE
        if (keyLeft1)
        player1X = player1X - dx1;
        else if (keyRight1)
        player1X = player1X + dx1;

        if (keyLeft2)
        player2X = player2X - dx2;
        else if (keyRight2)
        player2X = player2X + dx2;
    */

    /*
        if (keyFaster1)
        Player1.speed = Util.accelerate(Player1.speed, accel, dt);
        else if (keySlower1)
        Player1.speed = Util.accelerate(Player1.speed, breaking, dt);
        else
        Player1.speed = Util.accelerate(Player1.speed, decel, dt);

        if (keyFaster2)
        Player2.speed = Util.accelerate(Player2.speed, accel, dt);
        else if (keySlower2)
        Player2.speed = Util.accelerate(Player2.speed, breaking, dt);
        else
        Player2.speed = Util.accelerate(Player2.speed, decel, dt);


        if (((Player1.X < -1) || (Player1.X > 1)) && (Player1.speed > offRoadLimit))
        Player1.speed = Util.accelerate(Player1.speed, offRoadDecel, dt);

        if (((Player2.X < -1) || (Player2.X > 1)) && (Player2.speed > offRoadLimit))
        Player2.speed = Util.accelerate(Player2.speed, offRoadDecel, dt);

    */


        if(isNaN(Player1.speed = parseFloat(Dom.get('vitesse1').textContent)*segmentLength)) Player1.speed = 0;
        if(isNaN(Player2.speed = parseFloat(Dom.get('vitesse2').textContent)*segmentLength)) Player2.speed = 0;

        //Player1.speed   = Util.limit(Player1.speed, 0, maxSpeed);
        //Player2.speed   = Util.limit(Player2.speed, 0, maxSpeed);

    }

    function updatehud(){

        if(!Player1.hasFinished){
            Dom.set('chronoPlayer1', Dom.get('chronotime').innerHTML);                                                      // chrono running for Player1
            if(Player1.topspeed < Player1.speed){
                Player1.topspeed = Player1.speed;                                                                           // save top speed for Player1
                Dom.set('topspeedPlayer1', Player1.topspeed/segmentLength);                                                 // display top speed for Player1
            }
        } 
        else Dom.set('chronoPlayer1', Dom.get('chrono1').innerHTML);                                                        // get the accurate time for Player1

        if(!Player2.hasFinished){
            Dom.set('chronoPlayer2', Dom.get('chronotime').innerHTML);                                                      // chrono running for Player2
            if(Player2.topspeed < Player2.speed){
                Player2.topspeed = Player2.speed;                                                                           // save top speed for Player2
                Dom.set('topspeedPlayer2', Player2.topspeed/segmentLength);                                                 // display top speed for Player2
            }
        }
        else Dom.set('chronoPlayer2', Dom.get('chrono2').innerHTML);                                                        // get the accurate time for Player2

        if(Dom.get('chronotime').innerHTML == "00:00:000"){
            Player1.hasFinished = false;
            Player2.hasFinished = false;
            Dom.set('displayW1', "");
            Dom.set('displayW2', "");
        }
        
        Dom.set('distancePlayer1', Math.round((Player1.position/nbOfSegments*finishLineDist/segmentLength)*Player1.malus));     // distance travelled by Player1
        Dom.set('distancePlayer2', Math.round((Player2.position/nbOfSegments*finishLineDist/segmentLength)*Player2.malus));     // distance travelled by Player2
        Dom.set('speedPlayer1', Player1.speed/segmentLength);                                                                   // continuously display speed for Player1
        Dom.set('speedPlayer2', Player2.speed/segmentLength);                                                                   // continuously display speed for Player2

    }

    //=========================================================================
    //                      RENDER THE GAME WORLD
    //=========================================================================

    function render() {

        var player1BaseSegment = findSegment(Player1.position, Player1.segments);
        var player2BaseSegment = findSegment(Player2.position, Player2.segments);

        //var player1PlayerSegment = findSegment(Player1.position+Player1.Z);
        //var player1Percent = Util.percentRemaining(Player1.position+Player1.Z, segmentLength);

        context1.clearRect(0, 0, width, height);
        context2.clearRect(0, 0, width, height);

        Render.background(context1, background, width, height, BACKGROUND.SKY);
        Render.background(context1, background, width, height, BACKGROUND.HILLS);
        Render.background(context1, background, width, height, BACKGROUND.TREES);

        Render.background(context2, background, width, height, BACKGROUND.SKY);
        Render.background(context2, background, width, height, BACKGROUND.HILLS);
        Render.background(context2, background, width, height, BACKGROUND.TREES);

        var n, player1Segment, player2Segment;

        for(n = 0 ; n < drawDistance ; n++) {

        player1Segment        = Player1.segments[(player1BaseSegment.index + n) % Player1.segments.length];
        player1Segment.looped = player1Segment.index < player1BaseSegment.index;
        player1Segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);

        player2Segment        = Player2.segments[(player2BaseSegment.index + n) % Player2.segments.length];
        player2Segment.looped = player2Segment.index < player2BaseSegment.index;
        player2Segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);

        Util.project(player1Segment.p1, (Player1.X * roadWidth), cameraHeight, Player1.position - (player1Segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(player1Segment.p2, (Player1.X * roadWidth), cameraHeight, Player1.position - (player1Segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

        Util.project(player2Segment.p1, (Player2.X * roadWidth), cameraHeight, Player2.position - (player2Segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(player2Segment.p2, (Player2.X * roadWidth), cameraHeight, Player2.position - (player2Segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);


        if (player1Segment.p1.camera.z <= cameraDepth)  // no need to render segments behind us
            continue;

        if (player2Segment.p1.camera.z <= cameraDepth)  // no need to render segments behind us
            continue;

        Render.segment(context1, width,
                        player1Segment.p1.screen.x,
                        player1Segment.p1.screen.y,
                        player1Segment.p1.screen.w,
                        player1Segment.p2.screen.x,
                        player1Segment.p2.screen.y,
                        player1Segment.p2.screen.w,
                        player1Segment.fog,
                        player1Segment.color);

        Render.segment(context2, width,
                        player2Segment.p1.screen.x,
                        player2Segment.p1.screen.y,
                        player2Segment.p1.screen.w,
                        player2Segment.p2.screen.x,
                        player2Segment.p2.screen.y,
                        player2Segment.p2.screen.w,
                        player2Segment.fog,
                        player2Segment.color);               

        }
/*
        for(n = (drawDistance-1) ; n > 0 ; n--) {
            player1Segment = Player1.segments[(player1BaseSegment.index + n) % Player1.segments.length];

            for(i = 0 ; i < player1Segment.sprites.length ; i++) {
                sprite      = player1Segment.sprites[i];
                spriteScale = player1Segment.p1.screen.scale;
                spriteX     = player1Segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
                spriteY     = player1Segment.p1.screen.y;
                Render.sprite(context1, width, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, player1Segment.clip);
            }
            
            if (player1Segment == player1PlayerSegment) {
                Render.player(context1, width, resolution, roadWidth, sprites, Player1.renderingStraight, Player1.speed/maxSpeed,
                              cameraDepth/Player1.Z,
                              width/2,
                              (height/2) - (cameraDepth/Player1.Z * Util.interpolate(player1PlayerSegment.p1.camera.y, player1PlayerSegment.p2.camera.y, player1Percent) * height/2));
              }
        }
*/
        Render.player(context1, width, resolution, roadWidth, sprites, Player1.renderingStraight,             // rendering player1 on own screen
                        Player1.speed/maxSpeed, cameraDepth/Player1.Z, width/2, height);


        if(Player2.position-Player1.position < 12000){                                                   // don't render the other player if he's too far (fog effect)
        Render.sprite(context1, width, roadWidth, sprites, Player2.renderingLeft,            // rendering player2's position on player1's screen
                    cameraDepth/Player2.Z/(Player2.position-Player1.position)*550, 
                    width/2, height, 
                    2, 
                    1-3.4*(Player2.position-Player1.position)/height + (0.01 * Math.random() * Player2.speed/maxSpeed * resolution) * Util.randomChoice([-1,1]));
        }


        Render.player(context2, width, resolution, roadWidth, sprites, Player2.renderingStraight,              // rendering player2 on own screen
                        Player2.speed/maxSpeed, cameraDepth/Player2.Z, width/2, height);

                    
        if(Player1.position-Player2.position < 12000){                                                   // don't render the other player if he's too far (fog effect)
        Render.sprite(context2, width, roadWidth, sprites, Player1.renderingRight,           // rendering player1's position on player2's screen
                    (cameraDepth/Player1.Z)/(Player1.position-Player2.position)*550, 
                    width/2, height, 
                    -3, 
                    1-3.4*(Player1.position-Player2.position)/height + (0.01 * Math.random() * Player1.speed/maxSpeed * resolution) * Util.randomChoice([-1,1]));
        }

    }

    //=========================================================================
    //                            BUILD ROAD GEOMETRY
    //=========================================================================

    function resetRoad() {
        Player1.segments = [];
        Player2.segments = [];
        var fullTrackLength = nbOfSegments + 3640;                                          // 3640 segments corresponds to 1km
        for(var n = 0 ; n < fullTrackLength ; n++) {
            Player1.segments.push({
                index: n,
                p1: { world: { z:  n   *segmentLength }, camera: {}, screen: {} },
                p2: { world: { z: (n+1)*segmentLength }, camera: {}, screen: {} },
                sprites: [],
                color: roadStyle? Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT : Math.floor(n/rumbleLength)%2 ? COLORS.ATHDARK : COLORS.ATHLIGHT
            });
            Player2.segments.push({
                index: n,
                p1: { world: { z:  n   *segmentLength }, camera: {}, screen: {} },
                p2: { world: { z: (n+1)*segmentLength }, camera: {}, screen: {} },
                sprites: [],
                color: roadStyle? Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT : Math.floor(n/rumbleLength)%2 ? COLORS.ATHDARK : COLORS.ATHLIGHT                                                         // 400m style
            });
        }
        
        for(var n = 0 ; n < rumbleLength ; n++){
        Player1.segments[findSegment(Player1.Z, Player1.segments).index + 4 + n].color = COLORS.START;                    // starting line
        Player2.segments[findSegment(Player2.Z, Player2.segments).index + 4 + n].color = COLORS.START;                    // starting line

        Player1.segments[findSegment(Player1.Z, Player1.segments).index + nbOfSegments-2 + n].color = COLORS.FINISH;      // finish line
        Player2.segments[findSegment(Player2.Z, Player2.segments).index + nbOfSegments-2 + n].color = COLORS.FINISH;      // finish line
        }
        trackLength = Player1.segments.length * segmentLength;

    //                                                                              TODO: ADD SPRITES
        addSprite(20,  SPRITES.TREE2, -1);
        addSprite(40,  SPRITES.BILLBOARD06, -1);
        addSprite(60,  SPRITES.BILLBOARD08, -1);
    
    }


    function findSegment(z, segments) {
        return segments[Math.floor(z/segmentLength) % segments.length];
    }

    function addSprite(n, sprite, offset) {
        Player1.segments[n].sprites.push({ source: sprite, offset: offset });
        Player2.segments[n].sprites.push({ source: sprite, offset: offset });
    }


    //=========================================================================
    //                       RENDERING COLORS FOR PLAYERS
    //=========================================================================

    function colorPicker(){
        switch(Player1.renderedColor){
            case 'RED':
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.RED;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.RED;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.RED;
                break;
            case 'BLUE': 
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.BLUE;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.BLUE;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.BLUE;
                break;
            case 'GREEN': 
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.GREEN;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.GREEN;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.GREEN;
                break;
            case 'YELLOW':
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.YELLOW;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.YELLOW;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.YELLOW;
                break;
            case 'PINK':
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.PINK;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.PINK;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.PINK;
                break;
            case 'CYAN':
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.CYAN;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.CYAN;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.CYAN;
                break;
            case 'ORANGE':
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.ORANGE;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.ORANGE;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.ORANGE;
                break;
            default:
                Player1.renderingStraight = SPRITES.PLAYER_STRAIGHT.RED;
                Player1.renderingLeft = SPRITES.PLAYER_LEFT.RED;
                Player1.renderingRight = SPRITES.PLAYER_RIGHT.RED;
        }

        switch(Player2.renderedColor){
            case 'RED':
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.RED;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.RED;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.RED;
                break;
            case 'BLUE': 
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.BLUE;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.BLUE;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.BLUE;
                break;
            case 'GREEN': 
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.GREEN;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.GREEN;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.GREEN;
                break;
            case 'YELLOW':
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.YELLOW;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.YELLOW;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.YELLOW;
                break;
            case 'PINK':
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.PINK;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.PINK;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.PINK;
                break;
            case 'CYAN':
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.CYAN;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.CYAN;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.CYAN;
                break;
            case 'ORANGE':
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.ORANGE;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.ORANGE;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.ORANGE;
                break;
            default:
                Player2.renderingStraight = SPRITES.PLAYER_STRAIGHT.RED;
                Player2.renderingLeft = SPRITES.PLAYER_LEFT.RED;
                Player2.renderingRight = SPRITES.PLAYER_RIGHT.RED;
        }
    }

    //=========================================================================
    //                            THE GAME LOOP
    //=========================================================================

    Game.run({
        canvas: canvas1, colorPicker: colorPicker, render: render, update: update, updatehud: updatehud, step: step,
        images: ["background", "sprites"],
        ready: function(images) {
        background = images[0];
        sprites    = images[1];
        reset();
        },
    });

    function reset(options) {
        options                = options || {};
        canvas1.width          = canvas2.width  = width  = Util.toInt(options.width,          width);
        canvas1.height         = canvas2.height = height = Util.toInt(options.height,         height);
        lanes                  = Util.toInt(options.lanes,          lanes);
        roadWidth              = Util.toInt(options.roadWidth,      roadWidth);
        cameraHeight           = Util.toInt(options.cameraHeight,   cameraHeight);
        drawDistance           = Util.toInt(options.drawDistance,   drawDistance);
        fogDensity             = Util.toInt(options.fogDensity,     fogDensity);
        fieldOfView            = Util.toInt(options.fieldOfView,    fieldOfView);
        segmentLength          = Util.toInt(options.segmentLength,  segmentLength);
        rumbleLength           = Util.toInt(options.rumbleLength,   rumbleLength);
        cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
        Player1.Z              = (cameraHeight * cameraDepth);
        Player2.Z              = (cameraHeight * cameraDepth);
        resolution             = height/480;

        if ((Player1.segments.length==0) || (Player2.segments.length==0) || (options.segmentLength) || (options.rumbleLength))
        resetRoad();                                                                                              // only rebuild road when necessary
    }

//});