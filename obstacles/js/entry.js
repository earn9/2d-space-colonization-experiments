import * as Vec2 from 'vec2';
import Network from '../../core/Network';
import SourcePatterns from '../../core/SourcePatterns';
import VeinNode from '../../core/VeinNode';
import Path from '../../core/Path';
import SVGLoader from '../../core/SVGLoader';
import { random, getCircleOfPoints } from '../../core/Utilities';
import { setupKeyListeners } from '../../core/KeyboardInteractions';

const leaf = require('../svg/leaf.svg');

let canvas, ctx;
let network;
let bounds;

const TRIANGLE = 0;
const SQUARE = 1;
const CIRCLE = 2;
const LEAF = 3;
let currentBoundsShape = TRIANGLE;

let obstacles = [];

// Create initial conditions for simulation
let setup = () => {
  // Initialize canvas and context
  canvas = document.getElementById('sketch');
  ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Set up bounding square
  setupBounds();

  // Create obstacles to avoid
  setupObstacles();

  // Setup Network with initial conditions
  setupNetwork();

  // Begin animation loop
  requestAnimationFrame(update);
}

let setupBounds = () => {
  switch(currentBoundsShape) {
    case TRIANGLE:
      bounds = getTriangleBounds();
      break;

    case SQUARE:
      bounds = getSquareBounds();
      break;

    case CIRCLE:
      bounds = getCircleBounds();
      break;

    case LEAF:
      bounds = getLeafBounds();
      break;
  }
}

let getTriangleBounds = () => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  return new Path(
    [
      [cx - 400, cy + 300],
      [cx, cy - 350],
      [cx + 400, cy + 300]
    ],
    'Bounds',
    ctx
  )
}

let getSquareBounds = () => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const sideLength = 800;

  return new Path(
    [
      [cx - sideLength/2, cy - sideLength/2],  // top left corner
      [cx + sideLength/2, cy - sideLength/2],  // top right corner
      [cx + sideLength/2, cy + sideLength/2],  // bottom right corner
      [cx - sideLength/2, cy + sideLength/2]   // bottom left corner
    ],
    'Bounds',
    ctx
  );
}

let getCircleBounds = () => {
  return new Path(
    getCircleOfPoints(
      window.innerWidth / 2,    // cx
      window.innerHeight / 2,   // cy
      350,                      // radius
      100                       // resolution
    ),
    'Bounds',
    ctx
  );
}

let getLeafBounds = () => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const shapeWidth = 900;
  const shapeHeight = 900;

  let polygon = SVGLoader.load(leaf)[0];

  // Translate the design to the screen center
  for(let point of polygon) {
    point[0] = cx - shapeWidth/2 + point[0];
    point[1] = cy - shapeHeight/2 + point[1];
  }

  return new Path(polygon, 'Bounds', ctx);
}

let setupObstacles = () => {
  // Ten random circles
  // for(let i=0; i<10; i++) {
  //   obstacles.push(
  //     new Path(
  //       getCircleOfPoints(
  //         window.innerWidth / 2 + random(-300,300),
  //         window.innerHeight / 2 + random(-300,300),
  //         random(20,70),
  //         100
  //       ),
  //       'Obstacle',
  //       ctx
  //     )
  //   );
  // }

  // Single circle in center
  obstacles.push(
    new Path(
      getCircleOfPoints(
        window.innerWidth / 2,
        window.innerHeight / 2 + 70,
        200,
        100
      ),
      'Obstacle',
      ctx
    )
  );
}

// Create the network with initial conditions
let setupNetwork = () => {
  // Initialize simulation object
  network = new Network(ctx);

  // Set up the auxin sources using pre-made patterns
  let randomSources = SourcePatterns.getRandomSources(500, ctx, bounds, obstacles);
  let gridSources = SourcePatterns.getGridOfSources(200, 200, ctx, bounds, obstacles);

  const cx = window.innerWidth/2;
  const cy = window.innerHeight/2;

  network.sources = gridSources;

  switch(currentBoundsShape) {
    case TRIANGLE:
      network.addVeinNode(
        new VeinNode(
          null,
          new Vec2(cx - 340, cy + 290),
          true,
          ctx
        )
      );

      // network.addVeinNode(
      //   new VeinNode(
      //     null,
      //     new Vec2(cx, cy - 300),
      //     true,
      //     ctx
      //   )
      // );

      // network.addVeinNode(
      //   new VeinNode(
      //     null,
      //     new Vec2(cx + 340, cy + 290),
      //     true,
      //     ctx
      //   )
      // );

      break;

    case CIRCLE:
      network.addVeinNode(
        new VeinNode(
          null,
          new Vec2(cx, cy + 300),
          true,
          ctx
        )
      );

      break;

    case SQUARE:
      // Add a set of random root veins throughout scene
      for(let i=0; i<10; i++) {
        let x = random(window.innerWidth);
        let y = random(window.innerHeight);
        let ok = true;

        // Only put root veins inside the bounds
        if(bounds != undefined && !bounds.contains(x, y)) {
          ok = false;
        }

        // Don't put root veins inside of obstacles
        if(obstacles != undefined && obstacles.length > 0) {
          for(let obstacle of obstacles) {
            if(obstacle.contains(x, y)) {
              ok = false;
            }
          }
        }

        if(ok) {
          network.addVeinNode(
            new VeinNode(
              null,
              new Vec2(x, y),
              true,
              ctx
            )
          );
        }
      }

      break;

    case LEAF:
      // Put a single root note at the base of the leaf
      network.addVeinNode(
        new VeinNode(
          null,
          new Vec2(
            window.innerWidth / 2 - 5,
            window.innerHeight / 2 + 220
          ),
          true,
          ctx
        )
      );

      break;
  }

  // Set up common keyboard interaction listeners
  setupKeyListeners(network);
}

// Main program loop
let update = (timestamp) => {
  network.update(undefined, obstacles);
  network.drawBackground();
  bounds.draw();

  for(let obstacle of obstacles) {
    obstacle.draw();
  }

  network.drawVeins();
  network.drawSources();

  requestAnimationFrame(update);
}

// Key commands specific to this sketch
document.addEventListener('keypress', (e) => {
  switch(e.key) {
    // r = reset simulation by reinitializing the network with initial conditions
    case 'r':
      setupNetwork();
      break;

    // b = toggle visibility of bounds
    case 'b':
      bounds.settings.ShowBounds = !bounds.settings.ShowBounds;
      break;

    // o = toggle visibility of obstacles
    case 'o':
      for(let obstacle of obstacles) {
        obstacle.settings.ShowObstacles = !obstacle.settings.ShowObstacles;
      }

      break;

    case '1':
      currentBoundsShape = TRIANGLE;
      setupBounds();
      setupNetwork();
      break;

    case '2':
      currentBoundsShape = SQUARE;
      setupBounds();
      setupNetwork();
      break;

    case '3':
      currentBoundsShape = CIRCLE;
      setupBounds();
      setupNetwork();
      break;

    case '4':
      currentBoundsShape = LEAF;
      setupBounds();
      setupNetwork();
      break;
  }
});


// Kick off the application
setup();