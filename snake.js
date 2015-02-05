Physics(function(world){
  var viewWidth = 400;
  var viewHeight = 400;

  var snakeVel;

  //define renderer
  var renderer = Physics.renderer('canvas', {
    el: 'viewport',
    width: viewWidth,
    height: viewHeight,
    meta: false, // don't display meta data
    debug: true,
  });



  // add the renderer
  world.add( renderer );

  // render on each step
  world.on('step', function(){
    world.render();
  });

  // bounds of the window
  var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

  // add an "apple"
  var apple = Physics.body('circle', {
    x: Math.floor((Math.random() * 380) + 6),
    y: Math.floor((Math.random() * 380) + 6),
    radius: 5,
    styles: {
      strokeStyle: '#351024',
      lineWidth: 1,
      fillStyle: 'red',
      angleIndicator: 'white',
      objectType: 'apple'
    }
  });

  world.add(apple);

  // define a "newApple" --but NOT added to world yet
  var newApple = Physics.body('circle', {
  radius: 5,
  styles: {
    fillStyle: 'green',
    angleIndicator: 'white',
    objectType: 'apple'
    }
  });


  //define snake 
  var snake = Physics.body('rectangle', {
    x: 200, // x-coordinate
    y: 250, // y-coordinate
    vx: 0.0, //starts at no velocity
    vy: 0.0,
    width: 10, //initial snake dimensions
    height: 10,
    mass: 120000000000, //"ghetto-coded" to get around angular velocity issue
    //snake appearance
    styles: {
      fillStyle: 'black',
      angleIndicator: 'white'
    }

  });

  //snake put to sleep
  snake.sleep(true);


  //snake added to world
  world.add(snake);


  
  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0,
      cof: 1
  }));

  // ensure objects bounce when edge collision is detected
  world.add(Physics.behavior('body-impulse-response') );

  world.add(Physics.behavior('body-collision-detection'));

  //smooths 'sweeps' the rendering of the collision detections
  world.add(Physics.behavior('sweep-prune') );


  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){
      world.step( time );
  });


  // user input for snake's direction changes
  window.addEventListener('keyup', function(event) {
    snake.sleep(false);
      if (event.keyCode === 37) {
        world.emit('move', 'left');
      } else if (event.keyCode === 39) {
        world.emit('move', 'right');
      } else if (event.keyCode === 38) {
        world.emit('move', 'top');
      } else if (event.keyCode === 40) {
        world.emit('move', 'down');
      }
  });

  // start the ticker
  Physics.util.ticker.start();


  // sets constant velocity of snake
  world.on('move', function(data, e) {
    var vel = snake.state.vel;
    if (data === 'left') {
      vel.set(-0.1, 0);
    } else if (data === 'right') {
      vel.set(0.1, 0);
    }
    else if (data === 'top') {
      vel.set(0, -0.1);
    }
    else {
      vel.set(0, 0.1);
    }

    // value designated to retrieve velocity within other functions
    snakeVel = vel;
  });

  // sets counter for scoring purposes
  var counter = 0;

  // collision detection mechanism
  world.on('collisions:detected', function(data, e) {
      data.collisions[0].bodyA.sleep(true);
      data.collisions[0].bodyB.sleep(true);

    // stipulates that apple and snake collisions result in:
    if (snake === data.collisions[0].bodyA && apple === data.collisions[0].bodyB || apple === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
      
      // the apple being removed from the world,
      world.removeBody(apple);
      
      // the newApple body has a randomly generated coordinate, 
      newApple.state.pos.set(Math.floor((Math.random() * 380)+11), Math.floor((Math.random() * 380)+11));
    
      // the players score increases
      counter++;

      // the snake's velocity is maintained and the snake stays awake (does not stop upon collision),
      snake.state.vel = snakeVel;
      snake.sleep(false); 

      // and add the newApple to the viewport for the snake to chase.
      world.add(newApple);



      //make sure to see if i can't also create ("newSnakeBit") and apend to Snake...changing colors of said bit to verify...
      // function snakeGrows(){
      //     snake.Append();
      // };
      // Physics.util.extend.add(newApple);   could some manipulation of this code create a new instance of the apple?
    }

    // this else block repeats the same steps 
    else if (snake === data.collisions[0].bodyA && newApple === data.collisions[0].bodyB || newApple === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
      console.log("snake eats NEW APPLE");
      world.removeBody(newApple);
      apple.state.pos.set(Math.floor((Math.random() * 380) + 11), Math.floor((Math.random() * 380) + 11));
      counter++;
      snake.state.vel = snakeVel;
      snake.sleep(false);
      //adds initial apple
      world.add(apple);
    }

    // if the snake collides with its own body, it dies. 
    // else if (snake === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
    //   console.log( "snake eats self");

      // Physics.util.ticker.stop();

    //   disconnect: function(world){
    //         world.off( 'remove:snake');
    //         world.off( 'remove:apple');
    //         this.clear();
    //     }
    // }

    // if there are any other collisions (like snake with wall), snake dies.
    else  {
      console.log( "snake dies");
     
      Physics.util.ticker.stop();
    
    }

    // keeps track of player score. 
    console.log("Your score is " + (counter*7));
  });



// this.respond(data);


// compound body
// var chainSim = function(world){
//     // create chains...                                MERELY A VARIABLE I BELIEVE :/
// }; 
// http://wellcaffeinated.net/PhysicsJS/basic-usage


// composite bodies still need to be built in. There's no easy way to do this, but you can create a custom body that creates other bodies (eg, custom body that extends a square, that creates two circles). Just add a "connect" and "disconnect" method to the custom body so you can add and remove the extra circle bodies when it's added to a world.

// Then you can use verlet constraints to attach them together.

// As for the appearance, you'd need to find a way to draw that yourself with canvas. If you wanted to have the physics of a curved polygon, you'd have to write that yourself. So it's probably easier to just skin it with an image. To do that just set "body.view = myImage"

// This is a bit outdated, but has some examples: http://flippinawesome.org/2013/12/02/building-a-2d-browser-game-with-physicsjs/
 // http://stackoverflow.com/questions/23668005/agregate-bodies-in-physicsjs




// body.before-game:after {
//     content: 'press "z" to start';
// }
// body.lose-game:after {
//     content: 'press "z" to try again';                    BEFORE & AFTER GAME!  (IN HTML)
// }
// body.win-game:after {
//     content: 'Win! press "z" to play again';
//http://modernweb.com/2013/12/02/building-a-2d-browser-game-with-physicsjs/

});