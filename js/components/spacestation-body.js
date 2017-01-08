AFRAME.registerComponent('spacestation-body', {
    dependencies: ['tube'],

    schema: {
        length: {type: "number", default: 5000},
        radius: {type: "number", default: 2500},
        segments: {type: "int", default: 64}
    },

    buildLayers: function () {
        this.clearLayers();

        var scalingFactor = (1/2500)*this.data.radius;
        var thicknessUnit = 100*scalingFactor;
        var layers = [
            //layers with radiusFactor and thicknessFactor
            {rf: 1, tf: 1}, //g1 layer
            {rf: 1.4, tf: 0.1},
            {rf: 0.6, tf: 2}
        ];

        for(var i=0; i<layers.length; i++){
            var lm = layers[i];
            var el = document.createElement("a-entity");
            el.setAttribute("tube", {
                length: this.data.length,
                radius: (lm.rf*this.data.radius)+(thicknessUnit*lm.tf),
                innerRadius: lm.rf*this.data.radius,
                segments: this.data.segments
            });
            this.el.appendChild(el);
        }
    },

    clearLayers: function () {
        var children = this.el.getChildren();
        for (var i = 0; i < children.length; i++) {
            var en = children[i];
            if (en.getAttribute("tube") != null) {
                this.el.removeChild(en);
            }
        }
    },

    init: function () {
        this.layers = [];
        this.buildLayers();
    },

    update: function (oldData) {
        this.buildLayers();
        var person = this.el.querySelector("#person");
        if (person != null) {
            person.setAttribute("position", {x: 0, y: -(this.data.radius - 110), z: 0});
        }
    }
});