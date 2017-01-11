AFRAME.registerComponent('spacestation-body', {
    dependencies: ['pipe'],

    schema: {
        length: {type: "number", default: 5000},
        radius: {type: "number", default: 2500},
        segments: {type: "int", default: 360}
    },

    buildLayers: function () {
        this.clearLayers();
        var scalingFactor = (1 / 2500) * this.data.radius;
        var thicknessUnit = 100 * scalingFactor;
        var layers = [
            //layers with radiusFactor and thicknessFactor
            {rf: 1, tf: 1}, //g1 layer
            {rf: 1.4, tf: 0.1},
            {rf: 0.6, tf: 2}
        ];

        for (var i = 0; i < layers.length; i++) {
            var lm = layers[i];
            var layer = document.createElement("a-entity");
            layer.className = "layer";
            layer.setAttribute("pipe", {
                height: this.data.length,
                outerRadius: (lm.rf * this.data.radius) + (thicknessUnit * lm.tf),
                innerRadius: lm.rf * this.data.radius,
                segments: this.data.segments
            });
            layer.setAttribute("rotation", "90 0 0");
            layer.setAttribute("static-body", "");
            this.layers.push(layer);
            this.el.appendChild(layer);
        }

        this.buildWalls();
    },

    buildWalls: function () {
        var angleRad = 0;
        var angleDeg = 0;
        var numWalls = 16;
        var wallHeight = this.data.radius / 4;
        var radius = this.data.radius - wallHeight / 2;
        var stepRad = (Math.PI * 2) / numWalls;
        var stepDeg = 360 / numWalls;

        for (var i = 0; i < numWalls; i++) {
            var newX = Math.round(radius * Math.cos(angleRad));
            var newY = Math.round(radius * Math.sin(angleRad));

            var wall = document.createElement("a-box");
            wall.setAttribute("class", "wall");
            wall.setAttribute("depth", this.data.length);
            wall.setAttribute("height", wallHeight);
            wall.setAttribute("width", 40);
            wall.setAttribute("position", {x: newX, y: newY, z: 0});
            wall.setAttribute("rotation", {x: 0, y: 0, z: angleDeg + 90});
            wall.setAttribute("static-body", "");
            this.walls.push(wall);
            this.el.appendChild(wall);
            angleRad += stepRad;
            angleDeg += stepDeg;
        }
    },

    clearLayers: function () {
        var children = this.el.getChildren();
        if (this.ready == true) {
            for (var i = children.length - 1; i > 0; i--) {
                var child = children[i];
                if (child.className == "layer" || child.className == "wall") {
                    this.el.removeChild(children[i]);
                }
            }
        }
    },

    init: function () {
        this.ready = false;
        this.gravityForce = 9.81;//ms²
        this.rotationTime = 60000; // in milliseconds: 1 minute
        this.layers = [];
        this.walls = [];
        this.buildLayers();
    },

    tick: function () {
        var deltaTime = Date.now() - this.rotationStartTime;
        var progress = (100/this.rotationTime)*deltaTime; //percent
        var newRot = this.el.getAttribute("rotation").z = (progress/100)*this.degreeAt60Seconds;
        this.el.setAttribute("rotation", {x:0, y:0, z:newRot});
    },

    update: function (oldData) {
        this.rotationStartTime = Date.now();
        this.degreeAt60Seconds = (Math.sqrt(this.gravityForce/this.data.radius))*(180/Math.PI)*60;
        this.degreeAt60Seconds *= 4; //speed up for tests
        console.log("degree in 60 seconds: "+this.degreeAt60Seconds);
        this.buildLayers();
        this.person = this.el.querySelector("#person");
        if (this.person != null) {
            this.person.setAttribute("position", {x: 0, y: -(this.data.radius - 110), z: 0});
        }
        this.ready = true;
    }
});