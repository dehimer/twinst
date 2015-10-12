define(['jquery'], function ($) {

    return function TagPicPostStream(params) {

        console.assert(params.target, 'target is not attached');

        //получить ip адрес клиента (для сокета)
        $.get('getip', function(data){
            
            var ip = 'http://'+data;

            //создание сокетного соединения
            var socket = io(ip);

            var imagesel = $('#images');
            //новые фото инстаграмма
            socket.on('new:insts', function (data) {

                //получить адрес поста
                var url = data.show;
                $.ajax({
                    url: url,
                    type: 'POST',
                    crossDomain: true,
                    dataType: 'jsonp'
                }).done(function (data) {

                    var markup = '';
                    var insts = data.data;

                    //отобразить фотографии поста
                    _.each(insts, function (inst) {
                        markup += '<div data-leftcount="1" style="margin-top:10px;border:2px solid #f90;opacity:0;">'
                        
                        if(inst.images.standard_resolution)
                        {
                            // markup += '<div style="">'
                                    markup += '<img src="'+inst.images.standard_resolution.url+'" style="border:1px solid black;vertical-align:top;max-width:100%;"/>';
                            // markup += '</div>'
                        }
                        markup += '</div>'
                    });
                    
                    //добавляем состояние
                    var newmessage = $(markup);
                    newmessage.find('img').bind('load', function () {

                        newmessage.animate({
                            opacity:1
                        }, 250);
                    });
                    //добавить новое сообщение
                    newmessage.prependTo(imagesel);
                    // imagesel.prepend(markup);
                    //удалить все кроме первых 15 сообщений
                    imagesel.children(':gt(15)').remove();
                }); 
            });

            var urlRegex = /(https?:\/\/[^\s]+)/g;
            /*
            $('body').html().replace(urlRegex, function(url) {
                return '<a href="' + url + '">' + url + '</a>';
            });
            */
    
            //новые твиты
            socket.on('new:tweets', function (data) {

                var markup = '';
                //если есть список твитов
                if(data && data.list)
                {
                    //если 1 объект - создать массив из одного объекта
                    var tweets = _.isArray(data.list)?data.list:[data.list];
                    //проходим по каждому твиту
                    _.each(tweets, function (tweet) {
                        //не ретвит и имеет картинку
                        if(!tweet.retweeted && tweet.entities && tweet.entities.media)
                        {
                            markup += '<div style="margin-top:10px;border:2px solid #09f;opacity:0;">'
                                //текст твита
                                markup += tweet.text.replace(urlRegex, '');
                                // console.log(tweet.text.match(urlRegex))
                                markup += '<div>'
                                //проходим по всем картинкам твита
                                _.each(tweet.entities.media, function (media) {
                                    markup += '<div style="display:inline-block;text-align:center;">'
                                        markup += '<a href="'+media.media_url+'" target="_blank">'
                                            markup += '<img src="'+media.media_url+'" style="border:1px solid black;vertical-align:top;max-width:100%;"/>';
                                        markup +='</a>'
                                    markup += '</div>'
                                });
                                markup += '</div>'
                            markup += '</div>'
                        }
                    });
                };

                //добавляем состояние
                var newmessage = $(markup);
                newmessage.find('img').bind('load', function () {

                    newmessage.animate({
                        opacity:1
                    }, 250);
                });
                //добавить новое сообщение
                newmessage.prependTo(imagesel);

                //добавление нового сообщения
                // imagesel.prepend(markup);
                //оставить первые 15 сообщений
                imagesel.children(':gt(15)').remove();
            });
        });
        

    }
})