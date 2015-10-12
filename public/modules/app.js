define([
    'underscore',
    'modules/tagpicpostsstrem'
], function(_, TagPicPostStream){

    return {
        start: function(){

            var tagPicPostStream = new TagPicPostStream({target:document.body, tag:'car'});
        }
    };
});