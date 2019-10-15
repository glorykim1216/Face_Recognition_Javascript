//server.js
// var http = require('http');
// http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.end('Hello World');
// }).listen(1337, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');


/**
 * 웹 서버에 html 파일 서비스 하기
 */
 
var http = require('http');
var fs = require('fs'); // 파일 읽기, 쓰기 등 을 할 수 있는 모듈
var express = require('express');
var app = express();

app.use('/script.js',express.static(__dirname+"/script.js"));
app.use('/face-api.min.js',express.static(__dirname+"/face-api.min.js"));
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

app.get('/a',function(req,res) {
 
    var data = req.query.data;

    console.log('GET Parameter = ' + data);


    var result = data + ' Succese';

    console.log(result);


    res.send({result:result});

});
