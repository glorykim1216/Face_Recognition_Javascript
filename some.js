var a =5;
var g = function(){
    console.log(a); 
    a+=1;
    return a;
    setInterval(function(){
        //console.log(a); 
        return a;
        //console.log(resizedDetections[0].unshiftedLandmarks._imgDims._width, resizedDetections[0].unshiftedLandmarks._imgDims._height)
      }, 100)
};
module.exports = g