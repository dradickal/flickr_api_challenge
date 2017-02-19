var photoSearch = function (searchText) {
    var API_KEY = "089063c49f6c8706a04b70f8a1f2abb2";

    var url = "https://api.flickr.com/services/rest/?" +
    "method=flickr.photos.search&" +
    "&text=" + searchText +
    "&content_type=1" +
    "&safe_search=1" +
    "&format=json" +
    "&jsoncallback=?" +
    "&api_key=" + API_KEY;


    return $.ajax({
        url: url,
        type: "GET",
        dataType: 'jsonp'
    });
}

$(document).ready(function() {
    $('#flickr_search').on('click', function() {
        var query = $('#flickr_query').val();
        photoSearch(query)
            .then(function(data) {
                console.log(data);
            });
    });
});
