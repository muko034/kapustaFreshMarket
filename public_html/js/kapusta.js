/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

// http://paulirish.com/2011/requestanimationframe-for-smart-animating
// shim layer with setTimeout fallback
/** Timer 60fps <--> ~= 16.67ms
 * usage: instead of setInterval(loop, 16) */
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

Array.prototype.clear = function() {
    this.splice(0, this.length);
};

/** Namespace Cabbage Field Game */
var CFG = {
    isLoggedIn: false,
    isTraining: false,
    ticks: 0,   // ilosc tickow od uruchomienia gry
    clickingTime: 0,  // ilosc tickow od ostatniego klikniecia
    beforeTime: null,
    // set up some inital values
    WIDTH: 320, 
    HEIGHT:  480, 
    scale:  1,
    // the position of the canvas
    // in relation to the screen
    offset: {top: 0, left: 0},
    // store all bubble, touches, particles etc
    entities: [],
    
    // we'll set the rest of these
    // in the init function
    RATIO:  null,
    currentWidth:  null,
    currentHeight:  null,
    canvas: null,
    ctx:  null,
    ua:  null,
    android: null,
    ios:  null,
    State: { INITIALIZATING: 0, WATING:1, PLAYING: 2, GAME_OVER: 3, TRAINING: 4 },
    state: 0,   // INITIALIZATING
    sprite: null,
    
        init: function() {
        CFG.sprite = document.getElementById("sprite");
        // the proportion of width to height
        CFG.RATIO = CFG.WIDTH / CFG.HEIGHT;
        // these will change when the screen is resize
        CFG.currentWidth = CFG.WIDTH;
        CFG.currentHeight = CFG.HEIGHT;
        // this is our canvas element
        CFG.canvas = document.getElementById("canvas");
        // it's important to set this
        // otherwise the browser will
        // default to 320x200
        CFG.canvas.width = CFG.WIDTH;
        CFG.canvas.height = CFG.HEIGHT;
        // the canvas context allows us to 
        // interact with the canvas api
        CFG.ctx = CFG.canvas.getContext('2d');
        // we need to sniff out android & ios
        // so we can hide the address bar in
        // our resize function
        CFG.ua = navigator.userAgent.toLowerCase();
        CFG.android = CFG.ua.indexOf('android') > -1 ? true : false;
        CFG.ios = ( CFG.ua.indexOf('iphone') > -1 || CFG.ua.indexOf('ipad') > -1  ) ? true : false;
        

        CFG.Model.set();
        CFG.View.set();
        
//        $("#sprite").canvasLoader({
//            'radius':10,
//            'color':'rgb(255,0,0)',
//            'dotRadius':10,
//            'backgroundColor':'transparent', 
//            'className':'canvasLoader',
//            'id':'canvas',
//            'fps':10
//        });
        
//        CFG.entities.push(new CFG.Button(50, CFG.HEIGHT/2-100, CFG.WIDTH-100, 30, "Graj o nagrody!"));
//        CFG.entities.push(new CFG.Button(CFG.WIDTH/2-100, CFG.HEIGHT/2-60, 150, 30, "Trenuj"));
//        
        

//        this.Model.sprayer = new CFG.Sprayer();
//        this.sprayer = new this.Sprayer();
//        console.log(this.sprayer);
        
        // listen for clicks
//        window.addEventListener('click', function(e) {
//            e.preventDefault();
////            CFG.ticks % CFG.Sprayer.SPRAY_DELAY == 0
//            if (CFG.Model.sprayer.isSpraying)
//                CFG.Input.set(e);
//        }, false);

        this.onMouseDown = function(e){
            CFG.Input.set(e);
            CFG.Input.tapped = true;
            if (CFG.state === CFG.State.PLAYING){
                CFG.Model.sprayer.isSpraying = true;
                CFG.clickingTime = CFG.ticks;
            } else if (CFG.state === CFG.State.WATING &&
                       CFG.ticks >  10 ){
                CFG.ticks = 0;
                CFG.beforeTime = Date.now();
                CFG.state = CFG.State.PLAYING;
                
                CFG.Model.sprayer.isSpraying = true;
                CFG.clickingTime = CFG.ticks;
            }
        };
        
        this.onMouseMove = function(e){
            if (CFG.state === CFG.State.PLAYING){
                var interval = CFG.ticks-CFG.clickingTime;
                if (interval % CFG.Sprayer.SPRAY_DELAY === 0)
                    CFG.Input.set(e);
            } else if(CFG.state === CFG.State.INITIALIZATING){
                CFG.Input.set(e);
            } else if (CFG.state === CFG.State.WATING &&
                       CFG.ticks >  10 ){
                CFG.ticks = 0;
                CFG.beforeTime = Date.now();
                CFG.state = CFG.State.PLAYING;
            }
            
//            element.onmousemove = null;
        };
        
        this.onMouseUp = function(e){
            e.preventDefault();
            CFG.Model.sprayer.isSpraying = false;
        };
        
        // listen for mouse events
        window.addEventListener('mousedown', function(e){ e.preventDefault(); onMouseDown(e); }, false);
        window.addEventListener('mousemove', function(e){ e.preventDefault(); onMouseMove(e); }, false);
        window.addEventListener('mouseup', function(e) { onMouseUp(e); }, false);

        // listen for touches
        window.addEventListener('touchstart', function(e){ e.preventDefault(); onMouseDown(e.touches[0]); }, false);
        window.addEventListener('touchmove', function(e) { e.preventDefault(); onMouseMove(e.touches[0]); }, false);
        window.addEventListener('touchend', function(e) { onMouseUp(e); }, false);

        // we're ready to resize
        CFG.resize();
        
//        var sprayer = new CFG.Sprayer(100, 100);
//        var array = sprayer.spray();
//        CFG.ctx.fillStyle = "#000000";
//        for (var i=0; i < array.length; i++){
//            CFG.ctx.fillRect(array[i].x, array[i].y, 1, 1);
//        }

        CFG.loop();

    },
            
    resize: function() {
    
        CFG.currentHeight = window.innerHeight;
        // resize the width in proportion
        // to the new height
        CFG.currentWidth = CFG.currentHeight * CFG.RATIO;

        // this will create some extra space on the
        // page, allowing us to scroll pass
        // the address bar, and thus hide it.
//        if (CFG.android || CFG.ios) {
//            document.body.style.height = (window.innerHeight + 50) + 'px';
//        }

        // set the new canvas style width & height
        // note: our canvas is still 320x480 but
        // we're essentially scaling it with CSS
        CFG.canvas.style.width = CFG.currentWidth + 'px';
        CFG.canvas.style.height = CFG.currentHeight + 'px';

        // the amount by which the css resized canvas
        // is different to the actual (480x320) size.
        CFG.scale = CFG.currentWidth / CFG.WIDTH;
        // position of canvas in relation to
        // the screen
        CFG.offset.top = CFG.canvas.offsetTop;
        CFG.offset.left = CFG.canvas.offsetLeft;
        
//        document.getElementById("playButton").style.scale
//        var x=$("#test").css("left"), y=$("#test").css("top");
//        var w=$("#test").css("width"), h=$("#test").css("height");
//        w = parseInt(w); h = parseInt(h);
//        var a = Math.round(100-(1-CFG.scale)*100); 
//        var b= Math.round(100-(1-CFG.scale)*100);
//        $("#test").css("-webkit-transform", "scale("+CFG.scale+")");
//        $("#test").css("top", b+"px");       
//        $("#test").css("left", a+"px");
//        var zxc = document.getElementById("test");
        
//                $("#test").css("-webkit-transform", "translate(-"+a+"px, -"
//                                                        +b+"px)");
//        


        
        if (CFG.View.contentPane != null){
            CFG.View.contentPane.resize();
        }
        

        // we use a timeout here as some mobile
        // browsers won't scroll if there is not
        // a small delay
        window.setTimeout(function() {
                window.scrollTo(0,1);
        }, 1);
    },
            
    // this is where all entities will be moved
    // and checked for collisions etc
    update: function() {
        CFG.Model.update();
        CFG.View.update();
        
        
    },
            
    // this is where we draw all the entities
    render: function() {
        CFG.View.render();
    },


    // the actual loop
    // requests animation frame
    // then proceeds to update
    // and render
    loop: function() {

        requestAnimFrame( CFG.loop );
        //console.log("ticks: " + CFG.ticks);
        CFG.ticks++;
        if (CFG.ticks % 6 !== 0) return;
        
        switch(CFG.state){
            case CFG.State.INITIALIZATING:
                CFG.isTraining = false;
                $("#canvas").css("cursor", "default");
                CFG.View.contentPane.repaint();
                break;
            case CFG.State.WATING:
                
                break;
            case CFG.State.TRAINING:
            case CFG.State.PLAYING:
//                CFG.ticks++;
                CFG.update();
                CFG.render();
                break;
            case CFG.State.GAME_OVER:
                $("#canvas").css("cursor", "default");
                CFG.beforeTime = Date.now()-CFG.beforeTime;
//                CFG.View.renderGameOverScreen();
               
                CFG.View.setContentPane(CFG.View.gameover);
                
                
                console.log(CFG.Model.field.scores);
                var scores = CFG.Model.field.scores;
                console.log(scores);
                if (scores !== 0){
                    scores += Math.random();
                    console.log(scores);
                    scores *= 100;
                    console.log(scores);
                    scores = Math.round(scores);
                }
                $("#scores").html("Zdobyłeś <b>"+scores+"</b> punktów.");
                if (!CFG.isTraining)
                    $("#rank").html("Jesteś na <b>13</b> miejscu.");
                else
                    $("#rank").html("");
                CFG.View.repaint();
                CFG.state = 99;
                break;
        }
    }
};

// abstracts various canvas operations into
// standalone functions
CFG.Draw = {

    clear: function(x, y, w, h) {
        CFG.ctx.clearRect(x, y, w, h);
    },


    rect: function(x, y, w, h, col) {
        CFG.ctx.fillStyle = col;
        CFG.ctx.fillRect(x, y, w, h);
    },

    circle: function(x, y, r, col) {
        CFG.ctx.fillStyle = col;
        CFG.ctx.beginPath();
        CFG.ctx.arc(x + 5, y + 5, r, 0,  Math.PI * 2, true);
        CFG.ctx.closePath();
        CFG.ctx.fill();
    },
            
    roundedRect: function(x ,y, w, h, r){        
        CFG.ctx.beginPath();
        CFG.ctx.moveTo(x,y+r);
        CFG.ctx.lineTo(x,y+h-r);
        CFG.ctx.quadraticCurveTo(x,y+h,x+r,y+h);
        CFG.ctx.lineTo(x+w-r,y+h);
        CFG.ctx.quadraticCurveTo(x+w,y+h,x+w,y+h-r);
        CFG.ctx.lineTo(x+w,y+r);
        CFG.ctx.quadraticCurveTo(x+w,y,x+w-r,y);
        CFG.ctx.lineTo(x+r,y);
        CFG.ctx.quadraticCurveTo(x,y,x,y+r);
        CFG.ctx.closePath();
    },
            
    fillRoundedRect: function(x ,y, w, h, r, col){
        this.roundedRect(x ,y, w, h, r);
        CFG.ctx.fillStyle = col;
        CFG.ctx.fill();
    },
            
    strokeRoundedRect: function(x ,y, w, h, r, col){
        this.roundedRect(x ,y, w, h, r);
        CFG.ctx.strokeStyle = col;
        CFG.ctx.stroke();
    },


    text: function(string, x, y, size, col) {
        CFG.ctx.font = 'bold '+size+'px Monospace';
        CFG.ctx.fillStyle = col;
        CFG.ctx.fillText(string, x, y);
    }

};

CFG.Model = {
    sprayer: null,
    field: null,
            
    set: function(){
        this.sprayer = new CFG.Sprayer();
        this.field = new CFG.Field();
    },
            
    reset: function(){
        this.sprayer.reset();
        this.field.reset();
    },
            
    update: function(){
        if (this.sprayer.herbicide <= 0)
            CFG.state = CFG.State.GAME_OVER;
        
        // spawn a new instance of Splatter
        // if the user has tapped the screen
//        if (CFG.Input.tapped) {
            // keep track of taps; needed to 
            // calculate accuracy
//            POP.score.taps += 1;
            // add a new touch
            CFG.Model.sprayer.x = CFG.Input.x;
            CFG.Model.sprayer.y = CFG.Input.y;
            if (this.sprayer.isSpraying){
                var p = new CFG.Point(CFG.Input.x, CFG.Input.y);
                if (this.field.isPointIn(p)){
                    var splatter = new CFG.Splatter(CFG.Model.sprayer.spray());
    //                CFG.entities.push(splatter);
                    (this.sprayer.herbicide)--;
                    CFG.View.progresBar.level = this.sprayer.herbicide / CFG.Sprayer.MAX_HERBICIDE;
                    CFG.View.addSplatter(splatter);
                    this.field.update(splatter);
                }
            
            }
            
            // set tapped back to false
            // to avoid spawning a new touch
            // in the next cycle
//            CFG.Input.tapped = false;
//            checkCollision = true;
//        }
    }
};

CFG.Container = function(){
  this.entities = [];
  
  this.add = function(obj){
      this.entities.push(obj);
  };
  
  this.resize = function(){
      var ent, str = "scale("+CFG.scale+")";
      for(var i=0; i<this.entities.length; i++){
          ent = this.entities[i];
          if (ent.visible === false) continue;
          $("#" + ent.id).css({
                "transform": str,
                "-webkit-transform": str,
                "-moz-transform": str,
                "-o-transform": str,
                "left": CFG.offset.left+ent.left*CFG.scale-(1-CFG.scale)*ent.width/2+"px",
                "top": CFG.offset.top+ent.top*CFG.scale-(1-CFG.scale)*ent.height/2+"px"
          });          
      }
  };
  
  this.repaint = function(){
      this.paint();
      
      var ent;
      for(var i=0; i<this.entities.length; i++){
          ent = this.entities[i];
          if (ent.id === "replayButton")
              console.log("asd");
          if (ent.visible === true){
            $("#" + ent.id).css("display", "inline");
          }
          else{
            $("#" + ent.id).css("display", "none");
          }
      }
      
      this.resize();
  };
};

CFG.View = {
    splatters: new Array(),
    progresBar: null,
    scoresLabel: null,
    timer: null,
    contentPane: null,
    menu: new CFG.Container(),
    gameover: new CFG.Container(),
    gamePanel: new CFG.Container(),
    
    set: function(){
        this.timer = new CFG.Timer();
        this.progresBar = new CFG.HerbicideBar();
        this.gamePanel.init();
        this.menu.init();
        this.gameover.init();
        this.contentPane = this.menu;
    },
            
    reset: function(){
        this.splatters.splice(0);
        this.progresBar.reset();
        this.timer.reset();
        
    },
            
    repaint: function(){ this.contentPane.repaint(); },
    
    addSplatter: function(splatter){
        this.splatters.push(splatter);
    },
            
    update: function(){
        for (var i = 0; i < this.splatters.length; i++) {
            this.splatters[i].update();
            
            // delete from array if remove property
            // flag is set to true
            if (this.splatters[i].remove) {
                this.splatters.splice(i, 1);
            }
        }
        if (CFG.ticks % CFG.Timer.TIMER_DELAY === 0){
            if (this.timer.timeleft > 0){
                this.timer.timeleft--;
            } else {
                CFG.state = CFG.State.GAME_OVER;
            }
        }
//        
//        if (this.progresBar.level < 0.2)
//            this.progresBar.color = "#ff0000";
    },
    
    render: function(){
//        CFG.Draw.rect(0, 0, CFG.WIDTH, CFG.HEIGHT, '#036');
//        CFG.Draw.clear(0, 0, CFG.WIDTH, CFG.HEIGHT);
        this.drawBackground();
        // cycle through all entities and render to canvas
        for (var i = 0; i < this.splatters.length; i++) {
            this.splatters[i].render();
        }
//        CFG.ctx.fillStyle = "rgba(0,0,0,1)";
        CFG.Model.sprayer.render();
        this.timer.render();
        this.progresBar.render();
    }, 
            
    renderStartScreen: function(){


        
        CFG.ctx.drawImage(CFG.sprite, 640, 0, 320, 480, 0, 0, 320, 480);
//        CFG.Draw.rect(0, 0, CFG.WIDTH, CFG.HEIGHT, "rgba(117, 117, 117, 0.4)");
//        CFG.Draw.text("Tap to start", CFG.WIDTH/2-70, CFG.HEIGHT/2, 20, "rgba(255,255,255,0.9)");
        for (var i=0; i < CFG.entities.length; i++){
            CFG.entities[i].render();
        }
        
    },
            
    renderGameOverScreen: function(){
        console.log(CFG.Model.field.scores);
        var scores = CFG.Model.field.scores;
        console.log(scores);
        scores += Math.random();
        console.log(scores);
        scores *= 100;
        console.log(scores);
        scores = Math.round(scores);
        CFG.Draw.rect(0, 0, CFG.WIDTH, CFG.HEIGHT, "rgba(117, 117, 117, 0.4)");
        CFG.Draw.fillRoundedRect(10, CFG.HEIGHT/2-25, CFG.WIDTH-20, 150, 10, "rgba(226,226,266,1)");
        CFG.Draw.text("Zdobyłeś " + scores + " punktów.", 
                      CFG.WIDTH/2-140, CFG.HEIGHT/2, 20, "rgba(0,0,0,1)");
        CFG.Draw.text("Top 3:", CFG.WIDTH/2-140, CFG.HEIGHT/2+40, 16, "#000000");
        CFG.Draw.text("1. asd               999999", CFG.WIDTH/2-140, CFG.HEIGHT/2+60, 16, "#0");
        CFG.Draw.text("2. zxc               999989", CFG.WIDTH/2-140, CFG.HEIGHT/2+80, 16, "#0");
        CFG.Draw.text("3. qwe               999945", CFG.WIDTH/2-140, CFG.HEIGHT/2+100, 16, "#0");
        console.log(CFG.beforeTime);
//        CFG.Draw.text(CFG.beforeTime, 10, 30, 20,"0");
    },
            
    drawBackground: function(){
        CFG.ctx.drawImage(CFG.sprite, 0, 0, 640, 960, 0, 0, 320, 480);
    },
    
    setContentPane: function(contentPane){
        var ent;
        for (var i=0; i<this.contentPane.entities.length; i++){
            ent = this.contentPane.entities[i];
            $("#"+ent.id).css("display", "none");
        }
        this.contentPane = contentPane;
        
    }       
};

CFG.View.menu.init = function(){
    this.add({"id": "playButton", "type": "button", "visible": true,
              "left": 70, "top": 200, "width": 200, "height": 40});
    this.add({"id": "tryButton", "type": "button", "visible": true,
              "left": 70, "top": 250, "width": 200, "height": 40});
    this.add({"id": "rankingButton", "type": "button", "visible": true,
              "left": 70, "top": 300, "width": 200, "height": 40});
    this.add({"id": "instructionButton", "type": "button", "visible": true,
              "left": 70, "top": 350, "width": 200, "height": 40});
          
    this.rankingArea = {"id": "ranking", "type": "area", "visible": false,
                        "left": 10, "top": 70, "width": 300, "height": 400};
    this.add(this.rankingArea);
    this.xButton = {"id": "xButton", "type": "button", "visible": false,
                    "left": 280, "top": 75, "width": 20, "height": 20};
    this.add(this.xButton);
    this.instructionArea = {"id": "instruction", "type": "area", "visible": false,
                    "left": 10, "top": 70, "width": 300, "height": 400};
    this.add(this.instructionArea);

    var ent;
    for(var i=0; i<this.entities.length; i++){
      ent = this.entities[i];
      $("#"+ent.id).css({
          "width": ent.width+"px",
          "height": ent.height+"px"
      });
    }
    
    $("#canvas").css("cursor", "default");

    document.getElementById("playButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.onPlayButtonClick(); }, false);
    document.getElementById("tryButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.onTryButtonClick(); }, false);
    document.getElementById("rankingButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.onRankingButtonClick(); }, false);
    document.getElementById("instructionButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.onInstructionButtonClick(); }, false);
    document.getElementById("xButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.onXButtonCkick(); }, false);

    
};

CFG.View.menu.paint = function(){
    CFG.ctx.drawImage(CFG.sprite, 640, 0, 320, 480, 0, 0, 320, 480);
    if (CFG.isLoggedIn){
        CFG.Draw.text("Cześć Kuba", 30, 130, 28, "#000000");
        CFG.Draw.text("ranking:\t124", 30, 155, 20, "#000000");
        CFG.Draw.text("punkty: \t6584123", 30, 175, 20, "#000000");
    }
};

CFG.View.gameover.init = function(){
    var d=0;
    if (CFG.isLoggedIn && CFG.isTraining === false) d = 50;
    this.add({"id": "gameOver", "type": "area", "visible": true,
              "left": 10, "top": 70, "width": 300, "height": 330+d});
    this.add({"id": "returnButton", "type": "button", "visible": true,
              "left": 20, "top": 350+d, "width": 40, "height": 40});
    this.add({"id": "exitButton", "type": "button", "visible": true,
              "left": 255, "top": 350+d, "width": 40, "height": 40});
    this.add({"id": "replayButton", "type": "button", "visible": true,
              "left": 85, "top": 350+d, "width": 150, "height": 40});

    var ent;
    for(var i=0; i<this.entities.length; i++){
      ent = this.entities[i];
      $("#"+ent.id).css({
          "width": ent.width+"px",
          "height": ent.height+"px"
      });
      
      $("#canvas").css("cursor", "default");
    }
    
//    var asd = $("#exitButton");
//    asd.hover(asd.css("background", "#ff0000"), function(){});

    document.getElementById("returnButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.returnToMenu()(); }, false);
    document.getElementById("tryButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.onTryButtonClick(); }, false);
    document.getElementById("exitButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.exit(); }, false);
    document.getElementById("replayButton").addEventListener('touchstart', function(e){ e.preventDefault(); CFG.replay(); }, false);
    
};

CFG.View.gameover.paint = function(){};

CFG.View.gamePanel.init = function(){
    
};

CFG.View.gamePanel.paint = function(){
    CFG.view.render();
};



CFG.Input = {

    x: 0,
    y: 0,
    tapped :false,

    set: function(data) {
        this.x = (data.pageX - CFG.offset.left) / CFG.scale;
        this.y = (data.pageY - CFG.offset.top) / CFG.scale;
    }

};

CFG.Point = function(x, y){
    this.x = x;
    this.y = y;
    
    /** Zwraca indeks w tablicy 0..262143 */
    this.hashCode = function(){
        if (this.x<0 || this.y<0)
            return -1;
        var x = Math.round(this.x);
        var y = Math.round(this.y);
//        console.log(x+" "+y);
        return (x<<9) + y;
    };

    this.equals = function(other){
        if (this === other)
              return true;
        if (!(other instanceof Point))
              return false;
        return (other.x === this.x && other.y === this.y);
    };
};

CFG.Field = function(){
    this.width = CFG.WIDTH;
    this.height = Math.round(CFG.HEIGHT/4*3);
    this.points = new Array(CFG.Field.CAPABILITY);
    this.verticalGap = CFG.HEIGHT - this.height;
    this.scores = 0;
    
    this.reset = function(){
        this.points.splice(0);
        console.log("points.length " + this.points.length);
        this.scores = 0;
    };
    
     /** Funkcja sprawdza czy punkt jest w środku pola. */
    this.isPointIn = function(point){
        return (point.x >= 0 && point.x < this.width &&
                point.y >= this.verticalGap && point.y < CFG.HEIGHT);
    };

    this.update = function(splatter){
        var p, index = -1;
        for (var i=0; i < splatter.points.length; i++){
            p = splatter.points[i];
            
            if (this.isPointIn(p)){
                index = p.hashCode();
//                console.log(index);
                if (!(this.points[index])){
                    this.points[index] = true;
                    this.scores++;
                }
            }
        }
    };
};

CFG.Field.CAPABILITY = 25000;

CFG.Sprayer = function(){
    this.x = CFG.WIDTH/2; this.y = CFG.HEIGHT/2;
    this.herbicide = CFG.Sprayer.MAX_HERBICIDE;
    this.isSpraying = false;
    
    this.reset = function(){
        this.x = CFG.WIDTH/2; this.y = CFG.HEIGHT/2;
        this.herbicide = CFG.Sprayer.MAX_HERBICIDE;
        this.isSpraying = false;
    };
    
    
    this.spray = function() {
        var spatter = new Array();
        var p, radius = CFG.Sprayer.RADIUS;
        var x, y, splatterBound = CFG.Sprayer.SPLATTER_BOUND;
        for (var i=0; i < CFG.Sprayer.NUMBER_OF_DOTS; ++i){
            p = new CFG.Point();
            x = Math.random() * radius * 2 - radius;  // x = -RADIUS,...,RADIUS
            x = Math.round(x);
            p.x = x + this.x;
            x = Math.abs(x);
            y = Math.random() * splatterBound[x] * 2 - splatterBound[x];  // y = -SPLATTER_BOUND[x], ..., SPLATTER_BOUND[x]
            y = Math.round(y);
            p.y = y + this.y;
            spatter.push(p);
        }
        return spatter;
    };
    
    this.render = function(){
//        this.img.onload = function(){
            if (this.isSpraying){
                CFG.ctx.drawImage(CFG.sprite, 740, 480, 100, 135, this.x, this.y-15, 50, 68);
            } else {
                CFG.ctx.drawImage(CFG.sprite, 640, 480, 100, 135, this.x, this.y-15, 50, 68);
            }
//        };
//        this.img.src = "imgs/sprayer.png";
    };
};

CFG.Sprayer.MAX_HERBICIDE = 100;
CFG.Sprayer.RADIUS = 30;
CFG.Sprayer.NUMBER_OF_DOTS = 100;
CFG.Sprayer.SPRAY_DELAY = 6; // 6 * TICKS = 6 * (1000/60) = 100ms


CFG.Sprayer.quaterMidpointCircle = function(){
    var circlePoints = new Array();
    var x, y, d, deltaE, deltaSE, radius = CFG.Sprayer.RADIUS;
    x = 0;
    y = radius;
    d = 1-radius;
    deltaE = 3;
    deltaSE = 5 - (radius<<1);
    circlePoints.push(new CFG.Point(x,y));
    circlePoints.push(new CFG.Point(y,x));
    while (y>x)
    {
        if (d<0)
        {
            d += deltaE;
            deltaE += 2;
            deltaSE += 2;
            x++;
        }
        else
        {
            d += deltaSE;
            deltaE += 2;
            deltaSE +=4;
            x++;
            y--;
        }
        circlePoints.push(new CFG.Point(x,y));
        circlePoints.push(new CFG.Point(y,x));
    }
    return circlePoints;
};

CFG.Sprayer.setSplatterBound = function(){
    var circlePoints = CFG.Sprayer.quaterMidpointCircle();
    
    circlePoints.sort(function(p1, p2){ 
        return ((p1.x > p2.x) ? 1 : ((p1.x === p2.x) ? 0 : -1)); 
    });
    var bound = new Array();
    var prevX = 0;
    var maxY = CFG.Sprayer.RADIUS;
    for (var i=0; i < circlePoints.length; i++)
    {
        bound;
        if (circlePoints[i].x === prevX)
        {
            if (circlePoints[i].y > maxY) maxY = circlePoints[i].y;
        }
       else
        {
            bound.push(maxY);
            maxY = circlePoints[i].y;
        }
        prevX = circlePoints[i].x;
    }
    bound.push(maxY);
    circlePoints.splice(0); // == .clear();
    circlePoints = null;    //  it can be garbage colected
    return bound;
};

CFG.Sprayer.SPLATTER_BOUND = CFG.Sprayer.setSplatterBound();

CFG.Splatter = function(splatter){
    this.type = "splatter";
    this.points = splatter;
    this.opacity = 1;
    this.fade = 0.05;
    this.remove = false;
    
    this.update = function(){
        // reduct the opacity accordingly
        this.opacity -= this.fade; 
        // if opacity if 0 or less, flag for removal
        this.remove = (this.opacity < 0) ? true : false;
    };
    
    this.render = function(){
        var p;
        for (var i=0; i < this.points.length; i++){
            p  = this.points[i];
            CFG.Draw.rect(p.x, p.y, 2, 2, "rgba(255,255,0," + this.opacity + ")");
        }
    };
};


CFG.Timer = function(){
    this.timeleft = CFG.Timer.MAX_TIME;
    this.changed = false;
    
    this.reset = function(){
       this.timeleft = CFG.Timer.MAX_TIME; 
    };
    
    this.render = function(){
        CFG.Draw.text(this.timeleft, CFG.WIDTH-30, 20, 24, "rgba(0,0,0,1)");
    };
};

CFG.Timer.TIMER_DELAY = 60; // 60 * TICKS = 60 * (1000/60) = 1000ms = 1s
CFG.Timer.MAX_TIME = 19;    // -1

CFG.StartScreen = {
  render: function(){
      CFG.View.renderStartScreen();
  }
};

CFG.HerbicideBar = function(){
    this.color = "#ffff00";
    this.width = 25;
    this.height = 100;
    this.x = CFG.WIDTH-this.width-5;
    this.y = CFG.HEIGHT-this.height-5;
    this.level = 1;
    
    this.reset = function(){
        this.level = 1;
    };
    
    this.render = function(){
        CFG.ctx.save();        
        
        // Define the shadows
        CFG.ctx.shadowOffsetX = 2;
        CFG.ctx.shadowOffsetY = 2;
        CFG.ctx.shadowBlur = 5;
        CFG.ctx.shadowColor = '#666';
        
        CFG.Draw.fillRoundedRect(this.x, this.y, this.width, this.height, 5, "#ffffff");
        this.fill();
        CFG.ctx.lineWidth = 2;
        CFG.Draw.strokeRoundedRect(this.x, this.y, this.width, this.height, 5, "#0");
        CFG.ctx.restore();
        
    };
    
    this.fill = function(){
        var l = this.level;
        if (l < 0) l = 0;
        if (l > 1) l = 1;
        var x=this.x, y=this.y+this.height*(1-l)+1;
        var w=this.width, h=this.height*l-2;
        if (h<=0) return;
        CFG.Draw.rect(x, y, w, h, this.color);       
    };
    
};



ASD = {
   roundRect: function(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x, y+r);
        ctx.lineTo(x, y+h-r);
        ctx.arc(x+r, y+h-r, r, Math.PI, 0, true);
        ctx.lineTo(x+w, y+r);
        ctx.arc(x+r, y+r, r, 0, Math.PI/2, true);
        ctx.closePath();
        ctx.fill();
    },
    
    progressLayerRect: function(ctx, x, y, width, height, radius) {
        ctx.save();
        // Define the shadows
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#666';

         // first grey layer
        ctx.fillStyle = 'rgba(189,189,189,1)';
        ASD.roundRect(ctx, x, y, width, height, radius);
//
//        // second layer with gradient
//        // remove the shadow
//        ctx.shadowColor = 'rgba(0,0,0,0)';
//        var lingrad = ctx.createLinearGradient(0,y+height,0,0);
//        lingrad.addColorStop(0, 'rgba(255,255,255, 0.1)');
//        lingrad.addColorStop(0.4, 'rgba(255,255,255, 0.7)');
//        lingrad.addColorStop(1, 'rgba(255,255,255,0.4)');
//        ctx.fillStyle = lingrad;
//        roundRect(ctx, x, y, width, height, radius);

        ctx.restore();
    }

};


CFG.Button = function(x, y, width, height, text){
    this.type = "button";
    this.id = text;
    this.text = text;
    this.x = x;
    this.y = y;
    this.currX = x;
    this.currY = y;
    this.width = width;
    this.height = height;
    
    this.isIn = function(p){
        return (p.x >= this.x && p.x < this.width+this.x &&
                p.y >= this.y && p.y < this.height+this.y);
    };
    
    this.render = function(){
        CFG.ctx.save();
        // Define the shadows
        CFG.ctx.shadowOffsetX = 3;
        CFG.ctx.shadowOffsetY = 3;
        CFG.ctx.shadowBlur = 5;
        CFG.ctx.shadowColor = "rgba(0,0,0,0.8)";
        
//        CFG.Draw.fillRoundedRect(this.x, this.y, this.width, this.height, 10, "rgba(78,78,78,1)");
        
//        CFG.ctx.shadowColor = 'rgba(0,0,0,0)';
        var lingrad = CFG.ctx.createLinearGradient(this.x,this.y,this.x,this.height+this.y);
        lingrad.addColorStop(0, "#A4CEE6");
        lingrad.addColorStop(0.5, "#81B3E2");
        lingrad.addColorStop(0.5, "#468BCC");
        lingrad.addColorStop(1, "#56ADD6");
        CFG.ctx.fillStyle = lingrad;
        
        CFG.Draw.fillRoundedRect(this.x, this.y, this.width, this.height, 10, lingrad);
        CFG.ctx.restore();
//        console.log(this.text.length);
        CFG.Draw.text(text, this.x+this.width/2-this.text.length*11/2, this.y+this.height/2+5, 18, "rgba(255,255,255,1)");
    };
};

CFG.boom = function(){
    $("#playButton").css("display", "none");
};

CFG.onPlayButtonClick = function(){
    if (CFG.isLoggedIn){
        CFG.state = CFG.State.PLAYING;
        CFG.isTraining = false;
        CFG.View.reset();
        CFG.Model.reset();
        CFG.View.gameover.entities.splice(0);
        CFG.View.gameover.init();
        CFG.ticks = 0;
        $("#canvas").css("cursor", "none");
        CFG.View.setContentPane(CFG.View.gamePanel);
        CFG.View.splatters.clear();
        CFG.View.progresBar.level = 1;
        CFG.View.render();
        CFG.beforeTime = Date.now();
        
    }
    else{
        if (confirm("Musisz być zalogowany, żeby grać o nagrody. " +
                     "Chcesz teraz przejść do logowania?"            )){
            window.location = "http://www.fresh-market.pl/";
        }
    }
};

CFG.onTryButtonClick = function(){
    
    CFG.isTraining = true;
    CFG.View.reset();
    CFG.Model.reset();
    CFG.View.gameover.entities.splice(0);
    CFG.View.gameover.init();
    
    $("#canvas").css("cursor", "none");
    CFG.View.setContentPane(CFG.View.gamePanel);
    CFG.View.splatters.clear();
    CFG.View.progresBar.level = 1;
    CFG.View.render();
    CFG.ticks = 0;
    CFG.state = CFG.State.WATING;
    
};

CFG.onRankingButtonClick = function(){
    CFG.View.menu.rankingArea.visible = true;
    $("#ranking").css("display", "inline");
    CFG.View.menu.xButton.visible = true;
    $("#xButton").css("display", "inline");
    CFG.resize();
    CFG.resize(); 
};

CFG.onInstructionButtonClick = function(){
    CFG.View.menu.instructionArea.visible = true;
    $("#instruction").css("display", "inline");
    CFG.View.menu.xButton.visible = true;
    $("#xButton").css("display", "inline");
    CFG.resize();
    CFG.resize(); 
};

CFG.onXButtonCkick = function(){
    if (CFG.View.menu.rankingArea.visible === true){
        CFG.View.menu.rankingArea.visible = false;
        $("#ranking").css("display", "none");
    } else if (CFG.View.menu.instructionArea.visible === true){
        CFG.View.menu.instructionArea.visible = false;
        $("#instruction").css("display", "none"); 
    }
    CFG.View.menu.xButton.visible = false;
    $("#xButton").css("display", "none"); 
    CFG.resize(); 
};

CFG.returnToMenu = function(){
    CFG.View.setContentPane(CFG.View.menu);
    CFG.View.contentPane.repaint();
    CFG.state = CFG.State.INITIALIZATING;
    CFG.resize();   
};

CFG.exit = function(){
    $("#canvas").css("display", "none");
    CFG.View.setContentPane(null);
    $("#bye").css("display", "inline");
    setInterval(function(){
        window.location = "http://www.fresh-market.pl/";
    }, 1000);
    
//    window.close();
};

CFG.replay = function(){
      CFG.onTryButtonClick();
};


window.addEventListener('load', CFG.init, false);
window.addEventListener('resize', CFG.resize, false);

