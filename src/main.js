// Global variables
var canvas, engine, scene, camera;
var cubeDancer;
var collidableBoxes = [];

/**
 * Load the scene when the canvas is fully loaded
 */
document.addEventListener("DOMContentLoaded", function() {
    if (BABYLON.Engine.isSupported()) {
        initScene();
        initUI();
    }
}, false);

// Watch for browser/canvas resize events
window.addEventListener("resize", function() {
    engine.resize();
});

// Watch for user input events.
window.addEventListener("click", function(e) {
    // We try to pick an object
    var pickResult = scene.pick(e.offsetX, e.offsetY);

    // if the click hits the ground object, we change the impact position
    if (pickResult.hit) {
        var name = pickResult.pickedMesh.name;
        console.log('Object selected: ' + name);
        if (name.indexOf("cubeDancer") !== -1) {
            cubeDancer.rotate();
        }
    }
});

/**
 * Creates a new BABYLON Engine and initialize the scene
 */
function initScene() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);

    scene = new BABYLON.Scene(engine);
    // Setup cannonjs physics
    scene.enablePhysics(new BABYLON.Vector3(0, -0.6, 0), new BABYLON.OimoJSPlugin());

    // Create the camera
    camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(25, 20, -60), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas);

    // Create light
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 10, -5), scene);

    engine.runRenderLoop(function() {
        scene.render();

        // reset blocks that fall
        // for (var i = 0, n = collidableBoxes.length; i < n; ++i) {
        //     if (collidableBoxes[i].position.y < -100) {
        //         collidableBoxes[i].position.x = 0;
        //         collidableBoxes[i].position.y = 20.0;
        //         collidableBoxes[i].position.z = 0;
        //     }
        // };
    });

    // Created objects for the scene.
    createGround();
    createCollidableBoxes();
    cubeDancer = new DancingCube.CubeDancer(scene);
}

function initUI() {
    var openBoxButton = document.getElementById('openBoxButton');
    openBoxButton.addEventListener('click', function() {
        // open box
        cubeDancer.open();
    });

    var closeBoxButton = document.getElementById('closeBoxButton');
    closeBoxButton.addEventListener('click', function() {
        // close box
        cubeDancer.close();
    });
}

var createGround = function() {
    var material = new BABYLON.StandardMaterial('ground.material', scene);
    material.backFaceCulling = false;
    material.diffuseColor = new BABYLON.Color3(0.1, 0.9, 0.7);

    var ground = BABYLON.Mesh.CreateBox("ground", 40.0, scene);
    ground.material = material;
    ground.scaling.y = 0.05;
    ground.translate(BABYLON.Axis.Y, -20.0, BABYLON.Space.World);
    // physics
    ground.setPhysicsState({
        impostor: BABYLON.PhysicsEngine.BoxImpostor,
        move: false
    });
};

// Get a random number between two limits
var randomNumber = function(min, max) {
    if (min == max) {
        return (min);
    }
    var random = Math.random();
    return ((random * (max - min)) + min);
};

var createCollidableBox = function() {
    var boundingBox = BABYLON.Mesh.CreateBox("b", randomNumber(1, 3), scene);
    boundingBox.translate(BABYLON.Axis.Y, 20.0, BABYLON.Space.WORLD);
    boundingBox.rotation.x = randomNumber(-Math.PI / 2, Math.PI / 2);
    boundingBox.rotation.y = randomNumber(-Math.PI / 2, Math.PI / 2);
    boundingBox.rotation.z = randomNumber(-Math.PI / 2, Math.PI / 2);
    boundingBox.setPhysicsState({
        impostor: BABYLON.PhysicsEngine.BoxImpostor,
        move: true,
        mass: 1,
        friction: 0.5,
        restitution: 0.1
    });

    return boundingBox;
};
var createCollidableBoxes = function() {
    var bbMaterial = new BABYLON.StandardMaterial("cubeDancer.boundingBox", scene);
    bbMaterial.alpha = 0.2;
    for (var i = 0; i < 10; ++i) {
        var box = createCollidableBox();
        box.material = bbMaterial;

        collidableBoxes.push(box);
    }
};

/**
 * House animations since I figured out the animation pipeline
 */

DancingCube.Animation = {};

DancingCube.DegreesToRadians = function(degrees) {
    var radians = 0;

    if (parseInt(degrees) !== NaN &&
        degrees !== 0) {
        radians = degrees % 360;
        radians = (radians === 0) ? 360 : radians;
        radians = radians / 360; // percentage of full rotation in decimal form
        radians = (Math.PI * 2) * radians; // 6.28 is max radians in a circle PI*2
    }

    return radians;
};

DancingCube.Animation.CreateRotateFrom = function(fromVec, degreesVec, maxFPS) {
    var rotationToVec = new BABYLON.Vector3(
        DancingCube.DegreesToRadians(degreesVec.x),
        DancingCube.DegreesToRadians(degreesVec.y),
        DancingCube.DegreesToRadians(degreesVec.z)
    );

    // create a rotate animation for the box.
    var rotateAnimation = new BABYLON.Animation(
        "rotate",
        "rotation",
        maxFPS || 60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // An array with all animation keys
    var keys = [];

    //At the animation key 0, the value of scaling is "1"
    keys.push({
        frame: 0,
        value: fromVec
    });

    //At the animation key 100, the value of scaling is "1"
    keys.push({
        frame: 100,
        value: rotationToVec
    });

    rotateAnimation.setKeys(keys);

    return rotateAnimation;
};

DancingCube.Animation.CreateBounce = function(startPositionY, maxHeight, maxFPS) {
    var height = maxHeight || 10;
    height += startPositionY;
    var startPositionY = parseFloat(startPositionY.toString());

    // create a rotate animation for the box.
    var rotateAnimation = new BABYLON.Animation(
        "bounce",
        "position.y",
        maxFPS || 60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // An array with all animation keys
    var keys = [];

    //At the animation key 0, the value of scaling is "1"
    keys.push({
        frame: 0,
        value: startPositionY
    });

    keys.push({
        frame: 50,
        value: height
    });

    //At the animation key 100, the value of scaling is "1"
    keys.push({
        frame: 100,
        value: startPositionY
    });

    rotateAnimation.setKeys(keys);

    return rotateAnimation;
};
