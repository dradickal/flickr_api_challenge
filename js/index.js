var photoSearch = function (searchText) {
    var API_KEY = "089063c49f6c8706a04b70f8a1f2abb2";

    var url = "https://api.flickr.com/services/rest/?" +
    "method=flickr.photos.search&" +
    "&text=" + searchText +
    "&content_type=1" +
    "&safe_search=1" +
    "&format=json" +
    "&jsoncallback=?"+
    "&api_key=" + API_KEY;


    return $.ajax({
        url: url,
        type: "GET",
        dataType: 'jsonp'
    });
};

var makeImageUrl = function(photo, size) {
    return "https://farm"+ photo.farm +".staticflickr.com/"+ photo.server +"/"+ photo.id +"_"+ photo.secret +"_"+ size +".jpg";
};

$(document).ready(function() {
    $('#flickr_search').on('click', function() {
        var query = $('#flickr_query').val();
        photoSearch(query)
            .then(function(rsp) {
                if(rsp.stat === "fail") {
                    console.log("flickr Error("+ rsp.code +"):", rsp.message);
                }

                var $resultsList = $('<ul>');
                var photos = rsp.photos.photo;

                $(photos).each(function() {
                    $photo = $('<li>');
                    var $thumb = $('<img>').attr("src", makeImageUrl(this, 't'));
                    $photo.append($thumb);
                    var $caption = $("<p>").addClass('caption').text(this.title);
                    $photo.append($caption);
                    $photo.appendTo($resultsList);
                });

                $('#results').html($resultsList);
            });
    });
});
