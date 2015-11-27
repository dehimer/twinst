var util = require('util');
var _ = require('underscore');


var http = require('http');
var url = require("url");
var io = require('socket.io');
var static = require('node-static');
var file = new static.Server('./public');


var http = require('http');
var querystring = require('querystring');


//вытаскиваем ланные из пост запроса
var processPost = function(request, response, callback) {

    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = JSON.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

var tagname = 'car',
    instagram_settings = {
        'client_id': 'afb0a69b168047b69ac2e588833f436b',
        'client_secret': 'e6c52cec4e7b488e8095cfd52bff4b85',
        'callback_url': 'http://213.88.60.167:3000/callback',
        'redirect_uri': 'http://213.88.60.167:3000'
    },
    twitter_settings = {
        consumer_key:         'LRRaMQPFvYDRFAuv9k54QHRts'
      , consumer_secret:      'q3mBAUqX9NG53aqVf49Ie8q08KY24Rj6Yu2k4piPjCqDGO8hYC'
      , access_token:         '176345983-XCxDn6GSHIOqCIvSj7uEU9uXbaDz7HKJq1XB6ogq'
      , access_token_secret:  '4IEd6MnlkfcYnLOq78JNulIzTxu8LMwmZ7kED3z5Y64YT'
    };



var Twit = require('twit')

var T = new Twit(twitter_settings);

stream = T.stream('statuses/filter', { track: tagname})

stream.on('tweet', function (tweet) {

    if(tweet && sockets)
    {
        sockets.emit('new:tweets', {list: tweet});
    }
});


var server = http.createServer(function (request, response) {
	
    //получение ссылок на посты от инстаграмма в ответ на подписку
	if(request.method === 'POST')
	{
		//разбираем ответ
		processPost(request, response, function() {

            _.each(request.post, function(tag) {

		      	var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id='+instagram_settings.client_id;

		      	//отдаем ссылку на пост клиенту
		      	sockets.emit('new:insts', {show: url});
		    });

            response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end();
        });
	}
	else
	{
		// console.log(request)
	    request.addListener('end', function () {

            var url_parts = url.parse(request.url, true);
            var query = url_parts.query;

            // console.log(url_parts)

	        if(url_parts.pathname == '/')
	        {
                console.log('was tagname: '+tagname);
                if(query && query.tag)
                {
                    tagname = query.tag;
                };
                console.log('now: '+tagname);

                file.serveFile('/index.html', 200, {}, request, response);

                if(stream)
                {
                    stream.stop();
                }

                stream = T.stream('statuses/filter', { track: tagname})

                stream.on('tweet', function (tweet) {

                    console.log('tweet '+!!tweet+' '+!!sockets);
                    if(tweet && sockets)
                    {
                        console.log('emmitid');
                        sockets.emit('new:tweets', {list: tweet});
                    }
                });
                
	        }
            //вернуть клиенту его адрес для создания им сокетного соединения
	        else if (url_parts.pathname === '/getip') { // getip - вернуть IP-адрес и порт
	      		response.writeHead(200, {'Content-Type': 'text/html'});
	      		response.end(request.headers.host);
	      		return;
	    	}
            //подтверждаем подписку 
	    	else if( url_parts.pathname === '/callback' )
	    	{
	    		if(request.method === 'GET')
	    		{
	    			Instagram.subscriptions.handshake(request, response); 
	    		}
	    	}
            //просто отдаем файл
	        else
	        {
	            file.serve(request, response, function (e, res) {
	                if (e && (e.status === 404)) {
	                    file.serveFile('/not-found.html', 404, {}, request, response);
	                }
	            });
	        }
    	}).resume();
	}


}).on('error', function (error) {
    console.log(error);
}).listen(3000);

var sockets = io.listen(server);


//настройка для чтения постов с инстаграмма
/*
Instagram = require('instagram-node-lib');

Instagram.set('client_id', instagram_settings.client_id);
Instagram.set('client_secret', instagram_settings.client_secret);
Instagram.set('callback_url', instagram_settings.callback_url);
Instagram.set('redirect_uri', instagram_settings.redirect_uri);

//добавим полписку на посты инстаграмма
Instagram.subscriptions.subscribe({
  object: 'tag',
  object_id: tagname,
  aspect: 'media',
  callback_url: instagram_settings.callback_url,
  type: 'subscription',
  id: '#'
});
*/
// Instagram.subscriptions.unsubscribe({id:'7929019'});
// console.log(Instagram.subscriptions.list());
