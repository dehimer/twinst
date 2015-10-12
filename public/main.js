requirejs.config({
    urlArgs: "bust=" +  (new Date()).getTime(),
    baseUrl: './',
    paths: {
        // 'use': '../libs/use',
        'jquery': 'libs/jquery-2.1.1.min',
        'underscore': 'libs/underscore' // AMD support
    },
    shim: {
        underscore: {
            exports: '_'
        },
        jquery: {
            exports: '$'
        }
    },
    name: 'main',
    out: 'main-build.js',
    waitSeconds: 40
});

// alert(' ')
require([
    'jquery',
	'libs/domReady',
	'modules/app'
], function ($, domReady, app) {
    // alert('!')
	domReady(function () {
        // alert('!!')
        app.start();
    });
})