//this game will have only 1 state
var GameState = {
   init: function() {
        
    //adapt to screen size, fit all the game
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

  },
    
  //load the game assets before the game starts
  preload: function() {
    this.load.image('bg', 'assets/images/BG.jpg');
    this.load.image('bg2', 'assets/images/BG2.png');
    this.load.image('bb8-ball', 'assets/images/bb8-ball.png');
    this.load.image('bb8Head', 'assets/images/bb8-head.png');
    this.load.image('logo', 'assets/images/bb8Logo.png');
    this.load.audio('music', ['assets/music/rollin.mp3','assets/music/rollin.ogg']);

    this.offsetX = 2;
    this.offsetY = 1;
      
    var music;
      
  },
    
  //executed after everything is loaded
  create: function() {
    //background autoscroll, paralax 1 
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg');
    this.background.autoScroll(-50, 0);  
      
    //background autoscroll, paralax 2 
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg2');
    this.background.autoScroll(-100, 0);    
      
    this.bb8Roll = this.add.sprite(250, 250, 'bb8-ball');
    this.bb8Head = this.add.sprite(250, 165, 'bb8Head'); 
    this.logo = this.add.sprite(0, 0, 'logo');

	  //position in the center of the world
	  var centerX = this.world.centerX;
	  var centerY = this.world.centerY;
	  
      //BB8-Ball
      this.bb8Roll.position.setTo(250, 250);
	  this.bb8Roll.anchor.setTo(0.5);
	  this.bb8Roll.scale.setTo(0.7, 0.7);
	 
      //BB8-Head
      this.bb8Head.position.setTo(250, 165);
	  this.bb8Head.anchor.setTo(0.5);
	  this.bb8Head.scale.setTo(-0.7, 0.7);
      
    //Play music onload
    music = game.add.audio('music');
    music.loop = true;
    music.play();
	  
  },
    
  //this is executed multiple times per second
  update: function() {
            
    //this.bb8Head.x += this.offsetX;  
    this.bb8Head.y += this.offsetY;
      
    //BB8 Head Move up and down
      if (this.bb8Head.y > 168) {
		this.offsetY = -1;
	}
	  else if(this.bb8Head.y < 162) {
	  	this.offsetY = 1;
    }  
      
    //BB8 Ball rotate forever
    this.bb8Roll.angle += 2;
      
  },
	
};

//initiate the Phaser framework
var game = new Phaser.Game(640, 360, Phaser.AUTO);

game.state.add('GameState', GameState);
game.state.start('GameState');