/*
 * 웹 서버에 html 파일 서비스 하기
 */
 
var http = require('http');
var fs = require('fs'); // 파일 읽기, 쓰기 등 을 할 수 있는 모듈
var express = require('express');
var app = express();

app.use('/jquery-3.4.1.min.js',express.static(__dirname+"/jquery-3.4.1.min.js"));
app.use('/face-api.min.js',express.static(__dirname+"/face-api.min.js"));
app.use('/face-recognition.js',express.static(__dirname+"/face-recognition.js"));
app.use('/models',express.static(__dirname+"/models"));

// 404 error message : 페이지 오류가 발생했을때,
function send404Message(response){
    response.writeHead(404,{"Content-Type":"text/plain"}); // 단순한 글자 출력
    response.write("404 ERROR... ");
    response.end();
}
 
// 200 Okay : 정상적인 요청
app.get('/', function onRequest(request, response){
 
    if(request.method == 'GET' && request.url == '/'){
        response.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
        fs.createReadStream("./index.html").pipe(response); // 같은 디렉토리에 있는 index.html를 response 함
        //console.log(Test);
        
    } else {
        // file이 존재 하지않을때,
        send404Message(response);
 
    }
 
});

http.createServer(app).listen(8888);
console.log("Server Created...");

// face-recognition.js에서 데이터 여기서 데이터 받아서 다른함수에서 루프돌리고 전송?
var dataExpression;
var dataSleep;
app.get('/server',function(req,res) {
 
    dataExpression = req.query.expression;
    dataSleep = req.query.sleep;

    console.log('GET dataExpression = ' + dataExpression);
    console.log('GET dataSleep = ' + dataSleep);
    console.log('');

    res.send({dataExpression:''});
});


// TCP클라이언트
// Import net module.
var net = require('net');

// This function create and return a net.Socket object to represent TCP client.

// Create TCP client.
// var client = net.connect(option, function () {
//     console.log('Connection name : ' + connName);
//     console.log('Connection local address : ' + client.localAddress + ":" + client.localPort);
//     console.log('Connection remote address : ' + client.remoteAddress + ":" + client.remotePort);
// });
var client = net.connect({ port: 9090 });

//client.setTimeout(1000);
//client.setEncoding('utf8');

client.on('connect', function () {
    console.log('Connected to server');

    setInterval(function () {
        client.write("TEST-----");
    }, 1000);
});

// When receive server send back data.
client.on('data', function (data) {
    console.log('Server return data : ' + data);
});

// When connection disconnected.
client.on('end', function () {
    console.log('Client socket disconnect. ');
});

client.on('timeout', function () {
    console.log('connection timeout');
})

client.on('error', function (err) {
    console.error(JSON.stringify(err));
});