
function drawModel(mod){
    ctx.canvas.width = ctx.canvas.width;
    ctx.fillStyle = "red"
    ctx.fillRect(offsetX-2,offsetY-2,4,4)
    for(let i=0;i<mod.edges.length;i++){
        
        side = mod.edges[i];
        point0 = mod.points[side[0]]; point1 = mod.points[side[1]];
        
        x0=point0[0]*scaleFactor;y0=point0[1]*scaleFactor;
        x1=point1[0]*scaleFactor;y1=point1[1]*scaleFactor;
        
        ctx.moveTo(x0+offsetX,y0+offsetY);
        ctx.lineTo(x1+offsetX,y1+offsetY);
        ctx.lineWidth = lineWidth;

        ctx.stroke();
    }
}

function rotateAllPoints(obj,x,y,z){
    /*
    x *= Math.PI/180;
    y *= Math.PI/180;
    z *= Math.PI/180;*/

    for(let i=0;i<obj.points.length;i++){
        obj.points[i] = quaternionRotation(obj.points[i],y,x,z)
        /*
        pointT = [[obj.points[i][0]],[obj.points[i][1]],[obj.points[i][2]]]
        resultT = matrixMultiplication(generateRotationMatrix(x,y,z),pointT);
        obj.points[i] = [resultT[0][0],resultT[1][0],resultT[2][0]];*/

    }
    return obj
}

function matrixMultiplication(A,B){
    if(A[0].length != B.length){throw new Error("Invalid dimensions for matrices :(")}
    /*
    Stolen from the second answer here :
    https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
    Actual source is not accessible anymore.
    */
    var result = [];
    for (var i = 0; i < A.length; i++) {
        result[i] = [];
        for (var j = 0; j < B[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < A[0].length; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function quaternionMultiplication(A,B){
    if ((A.length != 4 )||(B.length != 4)){throw new Error("Invalid quaternions :(");}
    let t0 = A[0]*B[0] - A[1]*B[1] - A[2]*B[2] - A[3]*B[3];
    let t1 = A[0]*B[1] + A[1]*B[0] - A[2]*B[3] + A[3]*B[2];
    let t2 = A[0]*B[2] + A[1]*B[3] + A[2]*B[0] - A[3]*B[1];
    let t3 = A[0]*B[3] - A[1]*B[2] + A[2]*B[1] + A[3]*B[0];
    return [t0,t1,t2,t3];
}

function quaternionInversion(A){
    if (A.length != 4 ){throw new Error("Invalid quaternion :(");}
    return [A[0],-A[1],-A[2],-A[3]];
}

function quaternionRotation(point,alpha,beta,gamma){
    let uby2 = gamma * (Math.PI/180)/ 2 ;
    let vby2 = beta * (Math.PI/180)/ 2 ;
    let wby2 = alpha * (Math.PI/180)/ 2 ;

    let q0 = Math.cos(uby2)*Math.cos(vby2)*Math.cos(wby2) + Math.sin(uby2)*Math.sin(vby2)*Math.sin(wby2)
    let q1 = Math.sin(uby2)*Math.cos(vby2)*Math.cos(wby2) - Math.cos(uby2)*Math.sin(vby2)*Math.sin(wby2)
    let q2 = Math.cos(uby2)*Math.sin(vby2)*Math.cos(wby2) + Math.sin(uby2)*Math.cos(vby2)*Math.sin(wby2)
    let q3 = Math.cos(uby2)*Math.cos(vby2)*Math.sin(wby2) - Math.sin(uby2)*Math.sin(vby2)*Math.cos(wby2)

    rotationQuaternion = [q0,q1,q2,q3];
    p = [0,point[0],point[1],point[2]];

    ansQ = quaternionMultiplication(quaternionMultiplication(quaternionInversion(rotationQuaternion),p),rotationQuaternion);

    return [ansQ[1],ansQ[2],ansQ[3]];

}


function generateRotationMatrix(xA,yA,zA){
    zRot = [[Math.cos(zA),-Math.sin(zA),0],[Math.sin(zA),Math.cos(zA),0],[0,0,1]];
    yRot = [[Math.cos(yA),0,Math.sin(yA)],[0,1,0],[-Math.sin(yA),0,Math.cos(yA)]];
    xRot = [[1,0,0],[0,Math.cos(xA),-Math.sin(xA)],[0,Math.sin(xA),Math.cos(xA)]];
    return matrixMultiplication(zRot,matrixMultiplication(yRot,xRot))
}

window.addEventListener("deviceorientation", handleOrientation, true);
function handleOrientation(event) {
    //let absolute = event.absolute;
    // alpha SPINNING ON TABLE goes 0 - 360 -> 0
    // beta LIFTING TOWARDS YOUR FACE goes flat: 0 - 90 (portrait) - 180 (upside down) -> -180 - 0
    // gamma FLIPPING SIDEWAYS goes leftfacing: -90 - 0 - 90 -> -90 - 0 (upside down) - 90 -> -90 (left facing again)
    //alpha/yaw/y
    //beta/pitch/x
    //gamma/roll/z
    alpha = event.alpha
    beta = event.beta
    gamma = event.gamma
    //if(beta < 180){beta = 180+180+beta;} // actually dont think this is needed coz of the mod later
    //if(gamma<0){alpha +=180;beta+=180;}

    zAngle  = (alpha + 360)%360
    xAngle   = (beta + 360)%360 //-90 inside
    yAngle   = (gamma + 360)%360

    modelCopy = JSON.parse(JSON.stringify(model));
    drawModel(rotateAllPoints(modelCopy,xAngle,yAngle,zAngle))
}

/*
document.body.addEventListener("mousemove", function (e) {
    console.log(e.clientX,e.clientY);
    ctx.fillRect(e.clientX-2,e.clientY-2,4,4)
})
*/


document.addEventListener('keydown', function(event){
    
    if (["a","d"].includes(event.key)){
        yAngle += {"a":angleStep,"d":-angleStep}[event.key];
    }
    if (["w","s"].includes(event.key)){
        xAngle += {"w":-angleStep,"s":angleStep}[event.key];
    }
    if (["q","e"].includes(event.key)){
        zAngle += {"q":-angleStep,"e":+angleStep}[event.key];
    }

    modelCopy = JSON.parse(JSON.stringify(model));
    drawModel(rotateAllPoints(modelCopy,xAngle,yAngle,zAngle))
})

window.addEventListener('load', function(event){
    // flip it around to start
    // Honestly no clue why the thing is rotating 90 by itself in the first place
    // i must be projecting it wrong? anyway this is a small fix LOL
    //model = rotateAllPoints(model,90,0,0)
    drawModel(model);
    }
  );
