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

  //canvas.getContext('2d').scale(-1, 1);                 // 화면 좌우 반전(mirror), x 값 -1           => faceapi canvas
  //canvas.getContext('2d').translate(-canvas.width, 0);  // 화면 좌우 반전(mirror), 캔버스 위치 이동   => faceapi canvas

  // 얼굴인식 데이터 출력
  setInterval(async () => {

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) // 캔버스를 지우고 아래서 다시 그림
    faceapi.draw.drawDetections(canvas, resizedDetections)  // 박스 출력
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections) // 점 출력
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections) // 표정 출력

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
    var array = [
    resizedDetections[0].expressions.neutral,
    resizedDetections[0].expressions.happy,
    resizedDetections[0].expressions.sad,
    resizedDetections[0].expressions.angry,
    resizedDetections[0].expressions.fearful,
    resizedDetections[0].expressions.disgusted,
    resizedDetections[0].expressions.surprised
    ];

    // 가장 수치가 높은 표정을 num에 저장
    var expression = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"];
    var num;
    var max = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i] > max) {
        max = array[i];
        num = i;
      }
    }
    //console.log(expression[num]);

    // 졸음 체크
    var landmarks = resizedDetections[0].unshiftedLandmarks;

    // 왼쪽 눈(화면기준)
    var leftEye = EyeAspectRatio(landmarks.getLeftEye());
    console.log("earLeft : ", leftEye); // 범위 0.25~0.35
    // 오른쪽 눈(화면기준)
    var rightEye = EyeAspectRatio(landmarks.getRightEye());
    console.log("earRight : ", rightEye); // 범위 0.25~0.35

    // 얼굴 기울기(Outline 끝점)
    var outLine = landmarks.getJawOutline();
    var x = Math.abs(outLine[0]._x - outLine[16]._x);
    var y = Math.abs(outLine[0]._y - outLine[16]._y);
    var slope = y / x;

    console.log("slope : ",slope);
    // TEST_CODE - Text 출력
    //var ctx = canvas.getContext('2d');
    //ctx.font = '20px gothic';
    //ctx.fillStyle = "rgba(255,0,0,1)";
    var isSleep = false;
    if (leftEye < 0.30 && rightEye < 0.30 && slope > 0.1 )  // neutral 상태 & 눈크기 & 얼굴 기울기
    {
      isSleep = true;
    }
    //ctx.fillText(isSleep, 50, 50);
    console.log("isSleep : ",isSleep)

    // jQuery 서버와 통신
    $.ajax({
      url: '/server',
      dataType: 'json',
      type: 'GET',
      data: { expression: expression[num], sleep: isSleep },  // 서버에 넘겨줄 변수
      success: function (result) {
        if (result) {
          $('#get_output').html(result.result);
        }
      }
    })

  }, 100)

})

// EAR(eye aspect ratio) 눈 가로세로비
function EyeAspectRatio(eye) {
  // faceLandmark68 ex) 왼쪽눈 37 = eye[0], 38 = eye[1], 39 = eye[2], 40 = eye[3], 41 = eye[4], 42 = eye[5]

  var x1 = (eye[1]._x - eye[5]._x);
  var y1 = (eye[1]._y - eye[5]._y);
  var distance1 = Math.sqrt(x1*x1 + y1*y1);

  var x2 = (eye[2]._x - eye[4]._x);
  var y2 = (eye[2]._y - eye[4]._y);
  var distance2 = Math.sqrt(x2*x2 + y2*y2);

  var x3 = (eye[0]._x - eye[3]._x);
  var y3 = (eye[0]._y - eye[3]._y);
  var distance3 = Math.sqrt(x3*x3 + y3*y3);

  var EAR = (distance1 + distance2) / (distance3 * 2);  // EAR(eye aspect ratio)
  return EAR;
}