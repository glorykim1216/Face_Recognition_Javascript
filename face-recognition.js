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
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections) // 표정 출력

    // 안면인식 예외처리
    if (resizedDetections[0] == null) {
      // jQuery 서버와 통신
      $.ajax({
        url: '/server',
        dataType: 'json',
        type: 'GET',
        data: { expression: 'null', sleep: 'null' },
        success: function (result) {
          if (result) {
            $('#get_output').html(result.result);
          }
        }
      })

      return;
    }

    // 표정 -> "neutral","happy","sad","angry","fearful","disgusted","surprised"
    var array = [resizedDetections[0].expressions.neutral,
    resizedDetections[0].expressions.happy,
    resizedDetections[0].expressions.sad,
    resizedDetections[0].expressions.angry,
    resizedDetections[0].expressions.fearful,
    resizedDetections[0].expressions.disgusted,
    resizedDetections[0].expressions.surprised];

    var expression = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"];
    var num;
    var max = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i] > max) {
        max = array[i];
        num = i;
      }
    }
    console.log(expression[num]);

    // 졸음
    // Point Y좌표를 비교하여 체크
    // 왼쪽 눈(화면기준)
    var point38 = resizedDetections[0].unshiftedLandmarks._positions[37]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
    var point42 = resizedDetections[0].unshiftedLandmarks._positions[41]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
    var point39 = resizedDetections[0].unshiftedLandmarks._positions[38]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
    var point41 = resizedDetections[0].unshiftedLandmarks._positions[40]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
    // 오른쪽 눈(화면기준)
    var point44 = resizedDetections[0].unshiftedLandmarks._positions[43]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
    var point48 = resizedDetections[0].unshiftedLandmarks._positions[47]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
    var point45 = resizedDetections[0].unshiftedLandmarks._positions[44]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;
    var point47 = resizedDetections[0].unshiftedLandmarks._positions[46]._y / resizedDetections[0].unshiftedLandmarks._imgDims._height;

    console.log("1:", point42 - point38) // 범위 0.032~0.04
    console.log("2:", point41 - point39) // 범위 0.034~0.045
    console.log("3:", point48 - point44) // 범위 0.029~0.041
    console.log("4:", point47 - point45) // 범위 0.035~0.045

    // TEST_CODE - Text 출력
    //var ctx = canvas.getContext('2d');
    //ctx.font = '20px gothic';
    //ctx.fillStyle = "rgba(255,0,0,1)";
    var isSleep;
    if ((point42 - point38) < 0.038 && (point41 - point39) < 0.043 && (point48 - point44) < 0.039 && (point47 - point45) < 0.043)  // Point 사이거리
    {
      isSleep = true;
    }
    else {
      isSleep = false;
    }
    //ctx.fillText(isSleep, 50, 50);
    console.log(isSleep)

    // jQuery 서버와 통신
    $.ajax({
      url: '/server',
      dataType: 'json',
      type: 'GET',
      data: { expression: expression[num], sleep: isSleep },
      success: function (result) {
        if (result) {
          $('#get_output').html(result.result);
        }
      }
    })

  }, 100)

})
