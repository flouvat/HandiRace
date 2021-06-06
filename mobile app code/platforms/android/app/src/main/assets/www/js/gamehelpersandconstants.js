//=========================================================================
//                        minimalist DOM helpers
//=========================================================================

var Dom = {

  get:  function(id)                     { return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id); },
  set:  function(id, html)               { Dom.get(id).innerHTML = html;                        },
  on:   function(ele, type, fn, capture) { Dom.get(ele).addEventListener(type, fn, capture);    },

}

//=========================================================================
//                general purpose helpers (mostly maths)
//=========================================================================

var Util = {

  timestamp:        function()                  { return new Date().getTime();                                    },
  toInt:            function(obj, def)          { if (obj !== null) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return Util.toInt(def, 0); },
  toFloat:          function(obj, def)          { if (obj !== null) { var x = parseFloat(obj);   if (!isNaN(x)) return x; } return Util.toFloat(def, 0.0); },
  randomInt:	      function(min,max)	          { return Math.floor(Math.random() * Math.floor(max-min+1)) + min; },
  randomChoice:     function(options)           { return options[Util.randomInt(0, options.length-1)];            },
  exponentialFog:   function(distance, density) { return 1 / (Math.pow(Math.E, (distance * distance * density))); },

  increase:  function(start, increment, max) { // with looping but not useful yet
    var result = start + increment;
    while (result >= max)
      result -= max;
    while (result < 0)
      result += max;
    return result;
  },

  project: function(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
    p.camera.x     = (p.world.x || 0) - cameraX;
    p.camera.y     = (p.world.y || 0) - cameraY;
    p.camera.z     = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth/p.camera.z;
    p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
    p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
    p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
  }

}

//=========================================================================
//                  POLYFILL for requestAnimationFrame
//=========================================================================

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                 window.mozRequestAnimationFrame    || 
                                 window.oRequestAnimationFrame      || 
                                 window.msRequestAnimationFrame     || 
                                 function(callback, element) {
                                   window.setTimeout(callback, 1000 / 60);
                                 }
}



//=========================================================================
//                          GAME LOOP helpers
//=========================================================================

var Game = {

  run: function(options) {

    Game.loadImages(options.images, function(images) {

      options.ready(images);  // tell caller to initialize itself with loaded images
      
      options.loadColor();    // initialize models with their respective color

      var canvas = options.canvas,        // canvas render target is provided by caller
          update = options.update,        // method to update game logic is provided by caller
          updatehud = options.updatehud,  // method to update hud is provided by caller
          render = options.render,        // method to render game is provided by caller
          step   = options.step,          // fixed frame step (1/fps) is specified by caller
          now    = null,
          last   = Util.timestamp(),
          dt     = 0,
          gdt    = 0;

      function frame() {
        now = Util.timestamp();
        dt  = Math.min(1, (now - last) / 1000);
        gdt = gdt + dt;
        while (gdt > step) {
          gdt = gdt - step;
          update(step);
        }
        render();
        updatehud();
        last = now;
        requestAnimationFrame(frame, canvas);
      }
        frame();  // calling itself in a recursive way to start the loop
    });
  },

  //---------------------------------------------------------------------------

  loadImages: function(names, callback) { // load multiple images and callback when ALL images have loaded
    var result = [];
    var count  = names.length;

    var onload = function() {
      if (--count == 0)
        callback(result);
    };

    for(var n = 0 ; n < names.length ; n++) {
      var name = names[n];
      result[n] = document.createElement('img');
      Dom.on(result[n], 'load', onload);
      result[n].src = "images/" + name + ".png";
    }
  }

}

//=========================================================================
//                        canvas rendering helpers
//=========================================================================

var Render = {

  polygon: function(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  },

  //---------------------------------------------------------------------------

  segment: function(ctx, width, x1, y1, w1, x2, y2, w2, fog, color) {

    var r1 = w1/6,          // épaisseur des
        r2 = w2/6 ,         // bandes externes
        l1 = w1/12,         // épaisseur de la
        l2 = w2/12;         // bande du milieu
    
    ctx.fillStyle = color.grass;
    ctx.fillRect(0, y2, width, y1 - y2);
    
    Render.polygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
    Render.polygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
    Render.polygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);
    
    if (color.lane) {
      Render.polygon(ctx, x1 - l1/2, y1, x1 + l1/2, y1, x2 + l2/2, y2, x2 - l2/2, y2, color.lane);
    }
    
    Render.fog(ctx, 0, y1, width, y2-y1, fog);
  },

  //---------------------------------------------------------------------------

  background: function(ctx, background, width, height, layer, rotation, offset) {

    rotation = rotation || 0;
    offset   = offset   || 0;

    var imageW = layer.w/2;
    var imageH = layer.h;

    var sourceX = layer.x + Math.floor(layer.w * rotation);
    var sourceY = layer.y
    var sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
    var sourceH = imageH;
    
    var destX = 0;
    var destY = offset;
    var destW = Math.floor(width * (sourceW/imageW));
    var destH = height;

    ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    if (sourceW < imageW)
      ctx.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, width-destW, destH);
  },

  //---------------------------------------------------------------------------

  sprite: function(ctx, width, roadWidth, sprites, sprite, scale, destX, destY, offsetX, offsetY, clipY) {

                    //  scale for projection AND relative to roadWidth (for tweakUI)
    var destW  = (sprite.w * scale * width/2) * (SPRITES.SCALE * roadWidth);
    var destH  = (sprite.h * scale * width/2) * (SPRITES.SCALE * roadWidth);

    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));

    var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;
    if (clipH < destH)
      ctx.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h - (sprite.h*clipH/destH), destX, destY, destW, destH - clipH);

  },

  //---------------------------------------------------------------------------

  player: function(ctx, width, resolution, roadWidth, sprites, spriteStyle, speedPercent, scale, destX, destY) {

    var bounce = (1.5 * Math.random() * speedPercent * resolution) * Util.randomChoice([-1,1]);

    Render.sprite(ctx, width, roadWidth, sprites, spriteStyle, scale, destX, destY + bounce, -0.5, -1);
  },

  //---------------------------------------------------------------------------

  fog: function(ctx, x, y, width, height, fog) {
    if (fog < 1) {
      ctx.globalAlpha = (1-fog)
      ctx.fillStyle = COLORS.FOG;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
  },

}

//=============================================================================
//                          RACING GAME CONSTANTS
//=============================================================================

var COLORS = {
  SKY:  '#72D7EE',
  TREE: '#005108',
  FOG:  '#005108',
  ATHLIGHT: { road: '#9f5041', grass: '#10AA10', rumble: '#CCCCCC', lane: '#CCCCCC' },     // road: #9f5041 for an olympic 400m style
  ATHDARK:  { road: '#9c5041', grass: '#009A00', rumble: '#CCCCCC', lane: '#CCCCCC' },
  LIGHT:    { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC' },
  DARK:     { road: '#696969', grass: '#009A00', rumble: '#BBBBBB'                  },
  START:    { road: '#CCCCCC', grass: '#10AA10', rumble: '#CCCCCC'                  },
  FINISH:   { road: '#CCCCCC', grass: '#10AA10', rumble: '#CCCCCC'                  }
};

//---------------------------------------------------------------------------

var BACKGROUND = {
  HILLS: { x:   5, y:   5, w: 1280, h: 480 },
  SKY:   { x:   5, y: 495, w: 1280, h: 480 },
  TREES: { x:   5, y: 985, w: 1280, h: 480 }
};

//---------------------------------------------------------------------------

var SPRITES = {  
  PLAYER_LEFT: {
    RED:    { x:  0,    y: 0,   w: 80, h: 41},
    BLUE:   { x:  0,    y: 51,  w: 80, h: 41},
    GREEN:  { x:  0,    y: 102, w: 80, h: 41},
    YELLOW: { x:  0,    y: 153, w: 80, h: 41},
    PINK:   { x:  0,    y: 204, w: 80, h: 41},
    CYAN:   { x:  0,    y: 255, w: 80, h: 41},
    ORANGE: { x:  0,    y: 306, w: 80, h: 41},
    CHAIR: { x:  0,    y: 357, w: 80, h: 41}
  },

  PLAYER_STRAIGHT: {
    RED:    { x:  91,   y: 0,   w: 80, h: 41},
    BLUE:   { x:  91,   y: 51,  w: 80, h: 41},
    GREEN:  { x:  91,   y: 102, w: 80, h: 41},
    YELLOW: { x:  91,   y: 153, w: 80, h: 41},
    PINK:   { x:  91,   y: 204, w: 80, h: 41},
    CYAN:   { x:  91,   y: 255, w: 80, h: 41},
    ORANGE: { x:  91,   y: 306, w: 80, h: 41},
    CHAIR: { x:  91,   y: 357, w: 80, h: 41}
  },

  PLAYER_RIGHT: {
    RED:    { x:  182,  y: 0,   w: 80, h: 41},
    BLUE:   { x:  182,  y: 51,  w: 80, h: 41},
    GREEN:  { x:  182,  y: 102, w: 80, h: 41},
    YELLOW: { x:  182,  y: 153, w: 80, h: 41},
    PINK:   { x:  182,  y: 204, w: 80, h: 41},
    CYAN:   { x:  182,  y: 255, w: 80, h: 41},
    ORANGE: { x:  182,  y: 306, w: 80, h: 41},
    CHAIR: { x:  182,  y: 357, w: 80, h: 41}
  }
};

SPRITES.SCALE = 0.3 * (1/SPRITES.PLAYER_STRAIGHT.RED.w) // the reference sprite width should be 1/3rd the (half-)roadWidth