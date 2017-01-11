AFRAME.registerComponent('pipe', {

    multiple: true,

    schema: {
        outerRadius: {type: "number", default: 1},
        innerRadius: {type: "number", default: 0.9},
        height: {type: "number", default: 1},
        segments: {type: "int", default: 64}
    },

    build: function () {
        this.clear();
        var i, temp;
        this.geoms = [];

        this.outerPath = [new THREE.Vector2(this.data.outerRadius, -this.data.height / 2), new THREE.Vector2(this.data.outerRadius, this.data.height / 2)];
        this.outerLathe = new THREE.LatheGeometry(this.outerPath, this.data.segments);
        this.geoms.push(this.outerLathe);

        this.innerPath = [new THREE.Vector2(this.data.innerRadius, -this.data.height / 2), new THREE.Vector2(this.data.innerRadius, this.data.height / 2)];
        this.innerLathe = new THREE.LatheGeometry(this.innerPath, this.data.segments);
        this.geoms.push(this.innerLathe);
        //flip faces of the inner lathe
        for (i = 0; i < this.innerLathe.faces.length; i++) {
            var face = this.innerLathe.faces[i];
            temp = face.a;
            face.a = face.c;
            face.c = temp;
        }
        this.innerLathe.computeFaceNormals();
        this.innerLathe.computeVertexNormals();
        var faceVertexUvs = this.innerLathe.faceVertexUvs[0];
        for (i = 0; i < faceVertexUvs.length; i++) {
            temp = faceVertexUvs[i][0];
            faceVertexUvs[i][0] = faceVertexUvs[i][2];
            faceVertexUvs[i][2] = temp;
        }

        if(this.data.innerRadius > 0) {
            this.ringStart = new THREE.RingGeometry(this.data.innerRadius, this.data.outerRadius, this.data.segments, 0, 0, Math.PI * 2);
            this.geoms.push(this.ringStart);
            this.ringStart.rotateX(Math.PI/2);
            this.ringStart.translate(0, -this.data.height / 2, 0);

            this.ringEnd = new THREE.RingGeometry(this.data.innerRadius, this.data.outerRadius, this.data.segments, 0, 0, Math.PI * 2);
            this.geoms.push(this.ringEnd);
            this.ringEnd.rotateX(-Math.PI/2);
            this.ringEnd.translate(0, this.data.height / 2, 0);
        } else {
            this.capStart = new THREE.CircleGeometry( this.data.outerRadius, this.data.segments );
            this.geoms.push(this.capStart);
            this.capStart.rotateX(Math.PI/2);
            this.capStart.translate(0, -this.data.height / 2, 0);

            this.capEnd = new THREE.CircleGeometry( this.data.outerRadius, this.data.segments );
            this.geoms.push(this.capEnd);
            this.capEnd.rotateX(-Math.PI/2);
            this.capEnd.translate(0, this.data.height / 2, 0);
        }

        //merge
        this.mergeGeometry = new THREE.Geometry();
        for (i = 0; i < this.geoms.length; i++) {
            this.mergeGeometry.merge(this.geoms[i], this.geoms[i].matrix);
            this.geoms[i].dispose();
        }
        this.tubeMesh = new THREE.Mesh(this.mergeGeometry, this.material);

        this.el.object3D.add(this.tubeMesh);
    },

    clear: function () {
        if (this.geoms == null) return;
        while (this.geoms.length > 0) {
            var m = this.geoms.pop();
            m.dispose();
        }
        this.tubeMesh.geometry.dispose();
        this.el.object3D.remove(this.tubeMesh);
    },

    init: function () {
        this.material = new THREE.MeshStandardMaterial();
        this.build();
    },

    remove: function () {
        this.clear();
        this.material.dispose();
    },

    update: function (oldData) {
        if (this.data.outerRadius < this.data.innerRadius) this.data.innerRadius = this.data.outerRadius;
        this.build();
    }
});