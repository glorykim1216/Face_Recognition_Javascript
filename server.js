/*
 * 웹 서버에 html 파일 서비스 하기
 */

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
        //console.log(Test);

    } else {
        // file이 존재 하지않을때,
        send404Message(response);

    }

});

http.createServer(app).listen(8888);
console.log("Server Created...");

// face-recognition.js에서 안면인식 데이터 받음
app.get('/server', function (req, res) {

    var dataExpression = req.query.expression;
    var dataSleep = req.query.sleep;

    sendFaceDate(dataExpression, dataSleep);

    res.send({ dataExpression: '' });
});

var timeoutObj = null;
function sendFaceDate(expression, sleep) {

    // 안면인식 실패
    if(expression == 'null') {  
        console.log(expression); // 서버에 데이터 전송
        return;
    }

    if(sleep == 'sleep') {
        if (timeoutObj == null) {
            //console.log('sleep!!!!');
            timeoutObj = setTimeout(sleeping, 1500);
        }
    }
    else if (sleep == 'None') {
        
        if (timeoutObj != null) {
            clearTimeout(timeoutObj);
            timeoutObj = null;
        }
    }
    console.log(expression); // 서버에 데이터 전송
}

function sleeping() {
    console.log('TCP sleep!!!!');
    //clearTimeout(timeoutObj);
    timeoutObj = null;
    //socket.write("sleep");
}
/////////////////////////////// 클라이언트

// var net = require('net');

// function openSocket(){
//     var socket = net.connect({ port: 5555 });
//     socket.setKeepAlive(true);
//     socket.on('connect',onConnect.bind({},socket));
//     socket.on('error',onError.bind({},socket));
// }

// var interval;
// function onConnect(socket)
// {
//     console.log('TCP Socket is Open!');
//     socket.write("TCP Socket is Open!-----");
//     interval = setInterval(function () {
//         socket.write("TEST-----");
//     }, 1000);
// }

// function onError(socket){
//     console.log('TCP Error!');

//     clearInterval(interval);
//     socket.destroy();
//     socket.unref();

//     setTimeout(openSocket,1000);
// }
// openSocket();