/*
 * 웹 서버에 html 파일 서비스
 */
var config = require('./config');                   // config 파일
var importChannel = config.importChannel;           // GDs ImportChannel
var TCP_Port = parseInt(config.TCP_Port);           // GDs TCP Port
var HTTP_port = parseInt(config.HTTP_port);         // 클라이언트-서버 웹 통신 port
var eyesCloseTime = parseInt(config.eyesCloseTime); // Sleep 상태 체크 (눈 감고있는 시간)

// dictionary
var dicExpression = {};
dicExpression['null'] = '0';
dicExpression['neutral'] = '1';
dicExpression['happy'] = '2';
dicExpression['sad'] = '3';
dicExpression['sleep'] = '4';

var http = require('http');
var fs = require('fs'); // 파일 읽기, 쓰기 등 을 할 수 있는 모듈
var express = require('express');
var app = express();

app.use('/jquery-3.4.1.min.js', express.static(__dirname + "/jquery-3.4.1.min.js"));
app.use('/face-api.min.js', express.static(__dirname + "/face-api.min.js"));
app.use('/face-recognition.js', express.static(__dirname + "/face-recognition.js"));
app.use('/models', express.static(__dirname + "/models"));

// 404 error message : 페이지 오류가 발생했을때,
function send404Message(response) {
    response.writeHead(404, { "Content-Type": "text/plain" }); // 단순한 글자 출력
    response.write("404 ERROR... ");
    response.end();
}

// 200 Okay : 정상적인 요청
app.get('/', function onRequest(request, response) {
    if (request.method == 'GET' && request.url == '/') {
        response.writeHead(200, { "Content-Type": "text/html" }); // 웹페이지 출력
        fs.createReadStream("./index.html").pipe(response); // 같은 디렉토리에 있는 index.html를 response 함
    } else {
        // file이 존재 하지않을때,
        send404Message(response);
    }
});

http.createServer(app).listen(HTTP_port);
console.log("Server Created...");

// face-recognition.js에서 안면인식 데이터 받음
app.get('/server', function (req, res) {

    // 클라이언트(face-recognition.js)에서 변수 넘겨받음
    var dataExpression = req.query.expression;
    var dataSleep = req.query.sleep;

    faceDate(dataExpression, dataSleep);

    res.send({ dataExpression: '' });
});

var timeoutObj = null;
var sendExpression;
var isSleeping = false;
function faceDate(_dataExpression, _dataSleep) {
    // 안면인식 데이터(null, neutral, happy, sad, sleep) 이외 값이 들어올 경우 return 
    if(_dataExpression in dicExpression == false)
        return;

	if(_dataSleep == 'true')
    {
        if (timeoutObj == null && isSleeping == false) {
            timeoutObj = setTimeout(checkSleeping, eyesCloseTime);   // 타이머를 이용하여 Sleep 체크
        }
    }else
    {
        isSleeping = false;
        if (timeoutObj != null) 
        {
            clearTimeout(timeoutObj);
            timeoutObj = null;
        }
    }

    if(sendExpression != _dataExpression && isSleeping == false) {
        sendExpression = _dataExpression;
        sendData(sendExpression); // 서버에 데이터 전송
    }
}

function checkSleeping() {
    isSleeping = true;
    timeoutObj = null;
    sendExpression = 'sleep';
    sendData(sendExpression);// 서버에 데이터 전송
}

// TCP 서버에 데이터 전송
function sendData(data) {
    var startText = ':'
    var sendMessage = startText.concat(importChannel, ',', dicExpression[data]);
    console.log(sendMessage, ' => ', data);
    socket.write(sendMessage);
}

///////////////////////////// TCP 클라이언트
var net = require('net');
var socket;
function openSocket(){
    socket = net.connect({ port: TCP_Port });
    socket.setKeepAlive(true);
    socket.on('connect',onConnect.bind({},socket));
    socket.on('error',onError.bind({},socket));
}

var interval;
function onConnect(socket)
{
    console.log('TCP Socket is Open!');
    clearTimeout(openSocket);
}

function onError(socket){
    console.log('TCP Socket Error!');
    console.log('Connecting...');

    clearInterval(interval);
    socket.destroy();
    socket.unref();

    setTimeout(openSocket,1000);
}
openSocket();