/**
 * @author John Pittman <johnrichardpittman@gmail.com>
 */

(function(root, factory) {
    if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.DancingCube = root.DancingCube || {};
        root.DancingCube.CubeDancer = factory();
    }
}(this, function() {
    'use strict'

    /**
     * [CubeDancer description]
     * @param {[type]} opts [description]
     */
    function CubeDancer(scene, parent) {
        // keep reference to scene for animation control.
        this._scene = scene;

        this._scaling = new BABYLON.Vector3(1, 2, 1.5);
        this._startSize = 2.0;
        // might need later
        this._diameter = new BABYLON.Vector3(
            this._startSize * this._scaling.x,
            this._startSize * this._scaling.y,
            this._startSize * this._scaling.z
        );
        this._radius = new BABYLON.Vector3(
            this._startSize * this._scaling.x / 2,
            this._startSize * this._scaling.y / 2,
            this._startSize * this._scaling.z / 2
        );

        /**
         * Collision box
         */

        var bbMaterial = new BABYLON.StandardMaterial("cubeDancer.boundingBox", scene);
        bbMaterial.alpha = 0.3;
        this._boundingBox = BABYLON.Mesh.CreateBox("cubeDancer.boundingBox", 10, scene);
        this._boundingBox.parent = parent;
        this._boundingBox.material = bbMaterial;
       // this._boundingBox.scaling = new BABYLON.Vector3(1, 2, 1.5);

        /**
         * Dynamic box.
         */

        // center
        this._origin = new BABYLON.Mesh('cubeDanceer.origin', scene);
        this._origin.parent = this._boundingBox;

        // material
        this._material = new BABYLON.StandardMaterial('cubeDancer.sides', scene);
        this._material.backFaceCulling = false;
        this._material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);

        // hinge right
        this._rightHinge = new BABYLON.Mesh('cubeDanceer.hinge.right', scene);
        this._rightHinge.parent = this._origin;
        this._rightHinge.translate(BABYLON.Axis.X, this._radius.x, BABYLON.Space.LOCAL);
        this._rightHinge.translate(BABYLON.Axis.Y, -this._radius.y, BABYLON.Space.LOCAL);
        // hinge back
        this._backHinge = new BABYLON.Mesh('cubeDanceer.hinge.back', scene);
        this._backHinge.parent = this._origin;
        this._backHinge.translate(BABYLON.Axis.Z, this._radius.z, BABYLON.Space.LOCAL);
        this._backHinge.translate(BABYLON.Axis.Y, -this._radius.y, BABYLON.Space.LOCAL);
        // hinge left
        this._leftHinge = new BABYLON.Mesh('cubeDanceer.hinge.back', scene);
        this._leftHinge.parent = this._origin;
        this._leftHinge.translate(BABYLON.Axis.X, -this._radius.x, BABYLON.Space.LOCAL);
        this._leftHinge.translate(BABYLON.Axis.Y, -this._radius.y, BABYLON.Space.LOCAL);
        // hinge front
        this._frontHinge = new BABYLON.Mesh('cubeDanceer.hinge.front', scene);
        this._frontHinge.parent = this._origin;
        this._frontHinge.translate(BABYLON.Axis.Z, -this._radius.z, BABYLON.Space.LOCAL);
        this._frontHinge.translate(BABYLON.Axis.Y, -this._radius.y, BABYLON.Space.LOCAL);

        // side right
        this._rightSide = BABYLON.Mesh.CreatePlane("cubeDancer.side.right", this._startSize, scene);
        this._rightSide.parent = this._rightHinge;
        this._rightSide.material = this._material;
        this._rightSide.scaling = new BABYLON.Vector3(this._scaling.z, this._scaling.y, 1);
        this._rightSide.translate(BABYLON.Axis.Y, this._radius.y, BABYLON.Space.LOCAL);
        this._rightSide.rotate(BABYLON.Axis.Y, Math.PI / -2, BABYLON.Space.LOCAL);
        // side back
        this._backSide = BABYLON.Mesh.CreatePlane("cubeDancer.side.back", this._startSize, scene);
        this._backSide.parent = this._backHinge;
        this._backSide.material = this._material;
        this._backSide.scaling = new BABYLON.Vector3(this._scaling.x, this._scaling.y, 1);
        this._backSide.translate(BABYLON.Axis.Y, this._radius.y, BABYLON.Space.LOCAL);
        this._backSide.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        // side left
        this._leftSide = BABYLON.Mesh.CreatePlane("cubeDancer.side.left", this._startSize, scene);
        this._leftSide.parent = this._leftHinge;
        this._leftSide.material = this._material;
        this._leftSide.scaling = new BABYLON.Vector3(this._scaling.z, this._scaling.y, 1);
        this._leftSide.translate(BABYLON.Axis.Y, this._radius.y, BABYLON.Space.LOCAL);
        this._leftSide.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.LOCAL);
        // side front
        this._frontSide = BABYLON.Mesh.CreatePlane("cubeDancer.side.right", this._startSize, scene);
        this._frontSide.parent = this._frontHinge;
        this._frontSide.material = this._material;
        this._frontSide.scaling = new BABYLON.Vector3(this._scaling.x, this._scaling.y, 1);
        this._frontSide.translate(BABYLON.Axis.Y, this._radius.y, BABYLON.Space.LOCAL);
        // side top
        this._topSide = BABYLON.Mesh.CreatePlane("cubeDancer.side.top", this._startSize, scene);
        this._topSide.parent = this._origin;
        this._topSide.material = this._material;
        this._topSide.scaling = new BABYLON.Vector3(this._scaling.x, this._scaling.z, 1);
        this._topSide.translate(BABYLON.Axis.Y, this._radius.y, BABYLON.Space.LOCAL);
        this._topSide.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
        // side bottom
        this._topSide = BABYLON.Mesh.CreatePlane("cubeDancer.side.top", this._startSize, scene);
        this._topSide.parent = this._origin;
        this._topSide.material = this._material;
        this._topSide.scaling = new BABYLON.Vector3(this._scaling.x, this._scaling.z, 1);
        this._topSide.translate(BABYLON.Axis.Y, -this._radius.y, BABYLON.Space.LOCAL);
        this._topSide.rotate(BABYLON.Axis.X, Math.PI / -2, BABYLON.Space.LOCAL);

        /**
         * Physics impletementation
         */
        this._boundingBox.setPhysicsState({
            impostor: BABYLON.PhysicsEngine.BoxImpostor,
            move: true,
            mass: 1,
            friction: 100,
            restitution: 0.1
        });

        /**
         * Use a box for now until understanding more.
         */

        // this._boxSize = 1;
        // this._box = BABYLON.Mesh.CreateBox("cubeDancer", this._boxSize, scene);
        // this._box.parent = this._origin;
        // this._box.position = new BABYLON.Vector3(0, 0, 0);
        // this._box.scaling = new BABYLON.Vector3(2, 3, 2);;
        // this._box.rotation = new BABYLON.Vector3(0, 0, 0);
        // // align box with ground.
        // this._box.position.y = this._boxSize * this._box.scaling.y / 2;

        // keyframe animation. (the animation pipeline is odd so ghetto rigging rotation)
        //this._box.animations.push(DancingCube.Animation.Rotate('x', 360, 60));
        //this._box.animations.push(DancingCube.Animation.Rotate('y', 360, 60));
        //this._box.animations.push(DancingCube.Animation.Rotate('z', 360, 60));
        //this._box.animations.push(DancingCube.Animation.Bounce(this._box.position.y, 10, 60));

        /**
         * Hold animation functionality state.
         * Would normally use state machines for this madness but will come back when I know more)
         */

        this._rotate = false;
        this._startedRotation = false;
        this._rotateAnimationControl;

        /**
         * Store animations
         */

        // note: rotation of a standard MESH after it has been rotated does not work.

        this._animations = {
            rotateCube: DancingCube.Animation.CreateRotateFrom(this._origin.rotation, new BABYLON.Vector3(0, 360, 0), 60),
            bounce: DancingCube.Animation.CreateBounce(this._origin.position.y, 5, 60)
        };
    }

    CubeDancer.prototype = {
        rotate: function() {
            var _this = this;
            // toggle
            this._rotate = !this._rotate;

            if (this._rotate === true) {
                if (this._startedRotation === false) {
                    this._startedRotation = true;
                    this._rotateAnimationControl = this._scene.beginDirectAnimation(this._origin, [this._animations['rotateCube']], 0, 100, true, 1, function() {
                        _this._startedRotation = false;
                        _this._rotate = false;
                        console.log('Animation finished: rotateCube');
                    });
                } else {
                    this._rotateAnimationControl.restart();
                }
            } else {
                this._rotateAnimationControl.pause();
            }
        },
        bounce: function() {
            this._scene.beginDirectAnimation(this._origin, [this._animations['bounce']], 0, 100, false, 1, function() {
                console.log('Animation finished: bounce');
            });
        },
        open: function() {
            this._scene.beginDirectAnimation(this._frontHinge, [DancingCube.Animation.CreateRotateFrom(this._frontHinge.rotation, new BABYLON.Vector3(-90, 0, 0), 60), ], 0, 100, false, 1, function() {});
            this._scene.beginDirectAnimation(this._rightHinge, [DancingCube.Animation.CreateRotateFrom(this._rightHinge.rotation, new BABYLON.Vector3(0, 0, -90), 60), ], 0, 100, false, 1, function() {});
            this._scene.beginDirectAnimation(this._backHinge, [DancingCube.Animation.CreateRotateFrom(this._backHinge.rotation, new BABYLON.Vector3(90, 0, 0), 60)], 0, 100, false, 1, function() {});
            this._scene.beginDirectAnimation(this._leftHinge, [DancingCube.Animation.CreateRotateFrom(this._leftHinge.rotation, new BABYLON.Vector3(0, 0, 90), 60)], 0, 100, false, 1, function() {});
        },
        close: function() {
            this._scene.beginDirectAnimation(this._frontHinge, [DancingCube.Animation.CreateRotateFrom(this._frontHinge.rotation, new BABYLON.Vector3(0, 0, 0), 60)], 0, 100, false, 1, function() {});
            this._scene.beginDirectAnimation(this._rightHinge, [DancingCube.Animation.CreateRotateFrom(this._rightHinge.rotation, new BABYLON.Vector3(0, 0, 0), 60)], 0, 100, false, 1, function() {});
            this._scene.beginDirectAnimation(this._backHinge, [DancingCube.Animation.CreateRotateFrom(this._backHinge.rotation, new BABYLON.Vector3(0, 0, 0), 60)], 0, 100, false, 1, function() {});
            this._scene.beginDirectAnimation(this._leftHinge, [DancingCube.Animation.CreateRotateFrom(this._leftHinge.rotation, new BABYLON.Vector3(0, 0, 0), 60)], 0, 100, false, 1, function() {});
        },
        setPosition: function(vec3) {
            this._origin.position = vec3;
        },
        movePosition: function(vec3) {
            this._origin.position.addInPlace(vec3);
        },
        getPosition: function() {
            return this._origin.position;
        }
    };

    return CubeDancer;
}));
