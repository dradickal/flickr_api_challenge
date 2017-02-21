var photoSearch = function (searchText) {
    var API_KEY = "089063c49f6c8706a04b70f8a1f2abb2";

    var url = "https://api.flickr.com/services/rest/?" +
    "method=flickr.photos.search&" +
    "&text=" + searchText +
    "&content_type=1" +
    "&safe_search=1" +
    "&format=json" +
    "&extras=" + encodeURIComponent("url_t,url_o") +
    "&jsoncallback=?"+
    "&api_key="+ API_KEY;

    return $.ajax({
        url: url,
        type: "GET",
        dataType: 'jsonp'
    });
};

var makeImageUrl = function(photo, size) {
    var src = "https://farm"+ photo.farm +".staticflickr.com/"+ photo.server +"/"+ photo.id +"_"+ photo.secret;
    return src + (size ? "_"+ size +".jpg" : ".jpg");
};

var parseSearchResults = function(rsp) {
    var $results; 
    
    if(rsp.stat === "fail") {
        $results = $("<p>")
            .text("flickr Error("+ rsp.code +"): "+ rsp.message);
            
        $('#results').html($results);
    } 
    else if (rsp.stat === "ok") {
        var photos = rsp.photos.photo;

        $results = $('<div>');

        $(photos).each(function(index) {
            var tSrc = this.url_t || makeImageUrl(this, "t");
            var oSrc = this.url_o || makeImageUrl(this);
            
            var $photo = $('<div>')
                .addClass('thumbnail')
                .attr('data-full-size', oSrc);
            
            var $thumb = $('<img>')
                .attr("src", tSrc);

            $photo.append($thumb);
            $photo.appendTo($results);
        });

        $('#results').html($results.children());
    }
    
};

$(document).ready(function() {
    $('#flickr_search').on('click', function() {
        var query = $('#flickr_query').val();
        photoSearch(query)
            .then(parseSearchResults);
    });
    
    $('#flickr_query').on('keyup', function(e) {
        if (e.keyCode === 13) {
            var query = $(this).val();
            photoSearch(query)
                .then(parseSearchResults);
        }
    });
    
    $('#results').on('click', '.thumbnail', function () {
        console.log('Click:', this.dataset['fullSize']);
    });

});
