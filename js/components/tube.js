/**
 * Created by jellix on 07.01.2017.
 */
AFRAME.registerComponent('tube', {
    schema: {
        radius: { type: "number", default: 1 },
        innerRadius: { type: "number", default: 0.5 },
        length: { type: "number", default: 2 },
        segments: {type: "int", default:64}
    },

    build: function () {
        this.clear();
        var i, temp;

        this.outerPath = [new THREE.Vector2( this.data.radius, 0 ), new THREE.Vector2( this.data.radius, this.data.length )];
        this.outerLathe = new THREE.LatheGeometry( this.outerPath, this.data.segments );

        this.innerPath = [new THREE.Vector2( this.data.innerRadius, 0 ), new THREE.Vector2( this.data.innerRadius, this.data.length )];
        this.innerLathe = new THREE.LatheGeometry( this.innerPath, this.data.segments );
        //flip faces of the inner lathe
        for ( i = 0; i < this.innerLathe.faces.length; i ++ ) {
            var face = this.innerLathe.faces[ i ];
            temp = face.a;
            face.a = face.c;
            face.c = temp;
        }
        this.innerLathe.computeFaceNormals();
        this.innerLathe.computeVertexNormals();
        var faceVertexUvs = this.innerLathe.faceVertexUvs[ 0 ];
        for ( i = 0; i < faceVertexUvs.length; i ++ ) {
            temp = faceVertexUvs[ i ][ 0 ];
            faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
            faceVertexUvs[ i ][ 2 ] = temp;
        }

        this.ringStart = new THREE.RingGeometry( this.data.innerRadius, this.data.radius, this.data.segments, 0, 0, Math.PI * 2 );
        this.ringStart.rotateX(Math.PI/2);

        this.ringEnd = new THREE.RingGeometry( this.data.innerRadius, this.data.radius, this.data.segments, 0, 0, Math.PI * 2 );
        this.ringEnd.translate(0, 0, this.data.length);
        this.ringEnd.rotateX(-Math.PI/2);
        this.geoms = [this.outerLathe, this.innerLathe, this.ringStart, this.ringEnd];

        this.mergeGeometry = new THREE.Geometry();
        for( i=0; i<this.geoms.length; i++){
            this.mergeGeometry.merge(this.geoms[i], this.geoms[i].matrix);
        }

        this.tubeMesh = new THREE.Mesh(this.mergeGeometry, this.material);

        this.el.object3D.add(this.tubeMesh);
    },

    clear: function () {
        if(this.geoms == null) return;
        while(this.geoms.length > 0){
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
    },

    update: function (oldData) {
        if(this.radius < this.innerRadius) this.innerRadius = this.radius;
        this.build();
    }
});