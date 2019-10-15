  //ID 입력
  const video = document.getElementById('video')

  // 자바스크립트는 대부분의 작업들이 비동기로 이루어짐 => 콜백 중첩 이슈 발생
  // 따라서 Promise 패턴을 사용하여 콜백 중첩 해결
  // 다른 모델을 불러옴 -> 얼굴인식(68개 점)
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(startVideo) // startVideo 함수 실행

  // 웹캠 실행 함수
  function startVideo() {
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }

  video.addEventListener('play', () => {





    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    // 얼굴인식 데이터 출력
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) // 캔버스를 지우고 아래서 다시 그림
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

      //console.log(detections)

      // Point Y좌표
      var point38 = resizedDetections[0].unshiftedLandmarks._positions[37]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
      var point42 = resizedDetections[0].unshiftedLandmarks._positions[41]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;

      console.log(point42 - point38)
      // Text 출력
      var ctx = canvas.getContext('2d');
      ctx.font = '20px gothic';
      ctx.fillStyle = "rgba(255,0,0,1)";
      if (point42 - point38 < 0.04)  // Point 사이거리
      {
        ctx.fillText('sleep', 50, 50);
      }
      else {
        ctx.fillText('None', 50, 50);
      }

      $.ajax({
        url: '/a',
        dataType: 'json',
        type: 'GET',
        data: {data:'getg'},
        success: function(result) {
            if (result) {
              $('#get_output').html(result.result);
            }
       }
    })
      //console.log(resizedDetections[0].unshiftedLandmarks._imgDims._width, resizedDetections[0].unshiftedLandmarks._imgDims._height)
    }, 100)
    
  })
