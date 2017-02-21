function photoSearch(searchText) {
    this.searchText = searchText;
    this.paging = {};
}


photoSearch.prototype.search = function () {
    var API_KEY = "089063c49f6c8706a04b70f8a1f2abb2";

    var url = "https://api.flickr.com/services/rest/?" +
    "method=flickr.photos.search&" +
    "&text=" + this.searchText +
    "&content_type=1" +
    "&safe_search=1" +
    "&format=json" +
    "&extras=" + encodeURIComponent("url_t,url_o") +
    "&jsoncallback=?"+
    "&page=" + (this.paging.page ? this.paging.page + 1 : 1) +
    "&api_key="+ API_KEY;

    return $.ajax({
        url: url,
        type: "GET",
        dataType: 'jsonp'
    });
};

photoSearch.prototype.makeImageUrl = function(photo, size) {
    var src = "https://farm"+ photo.farm +".staticflickr.com/"+ photo.server +"/"+ photo.id +"_"+ photo.secret;
    return src + (size ? "_"+ size +".jpg" : ".jpg");
};

photoSearch.prototype.parseSearchResults = function() {
    var self = this;
    var photos = self.paging.photo;

    var $results = $('<div>');

    $(photos).each(function(index) {
        var tSrc = this.url_t || self.makeImageUrl(this, "t");
        var oSrc = this.url_o || self.makeImageUrl(this);
        
        var $photo = $('<div>')
            .addClass('thumbnail')
            .attr('data-full-size', oSrc);
        
        var $thumb = $('<img>')
            .attr("src", tSrc);

        $photo.append($thumb);
        $photo.appendTo($results);
    });

    if(self.paging.page === 1) {
        $('#results').html($results.children());
        $('#next-results').addClass('show');
    } else {
        $('#results').append($results.children());
        if(ps.paging.page === ps.paging.pages) {
            $('#next-results').removeClass('show');
        }
    }
};

photoSearch.prototype.showError = function(rsp) {
    var $results = $("<p>")
        .text("flickr Error("+ rsp.code +"): "+ rsp.message);
    
    $('#results').html($results);
}

$(document).ready(function() {
    var ps;

    function newSearch(query) {
        ps = new photoSearch(query);
        
        runSearch();
    }

    function runSearch() {
        ps.search()
            .then(function(rsp) {
                if(rsp.stat === "fail") {
                    ps.showError(rsp);
                }
                else if (rsp.stat === "ok") {
                    ps.paging = rsp.photos;
                    ps.parseSearchResults();
                }
            });
    }

    var $window = $(window);
    $('#next-results').on('click', function() {
        if(ps === undefined) {
            return;
        }
        if(ps.paging.page < ps.paging.pages) {
            runSearch();
        }
    });

    $('#flickr_search').on('click', function() {
        var query = $('#flickr_query').val();
        newSearch(query);
    });
    
    $('#flickr_query').on('keyup', function(e) {
        if (e.keyCode === 13) {
            var query = $(this).val();
            newSearch(query);
        }
    });
    
    $('#results').on('click', '.thumbnail', function() {
        var oSrc = this.dataset['fullSize'];
        var $img = $('<img>')
            .attr('src', oSrc);
            // .attr('width')
            // .attr('height');

        $('#fullSize').html($img);
        $('#modal').addClass('show');
         
    });

    $('#modal').on('click', function() {
        $(this).removeClass('show');
    });
});
