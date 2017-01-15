window.addEventListener("keyup", function(e){
    if(e.keyCode == 32){
        var el = scene.querySelector("#dummySphere");
        var curPos = new CANNON.Vec3().copy(el.getAttribute('position'));
        console.log(curPos);
        el.body.applyImpulse(
            /* impulse */        new CANNON.Vec3(-curPos.x, -curPos.y, 0),
            /* world position */ curPos
        );
    }
});