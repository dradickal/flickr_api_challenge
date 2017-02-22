/* 
 * Constructor function for the PhotoSearch obj
 * 
 * @param string searchText
 * @return PhotoSearch
 */
function PhotoSearch(searchText) {
    this.searchText = searchText;
    this.paging = {};
}

/* 
 * Ajax call to flickr API
 * - Uses searchText property for query
 * - Uses paging property to increase pagination
 */
PhotoSearch.prototype.search = function () {
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

/*
 * Used to generate img URLs if not returned from API
 * - size is a single character string defined by flickr to detemine img size.
 *  
 * @param object photo
 * @param string size (opt)
 * @return string
 */
PhotoSearch.prototype.makeImageUrl = function(photo, size) {
    var src = "https://farm"+ photo.farm +".staticflickr.com/"+ photo.server +"/"+ photo.id +"_"+ photo.secret;
    return src + (size ? "_"+ size +".jpg" : ".jpg");
};

/*
 * Loops through array of photos from API and injects
 * them onto the page.
 * - Uses paging property to access photos
 */
PhotoSearch.prototype.parseSearchResults = function() {
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


/*
 * Render API error onto page
 * - rsp should be response from API with rsp.stat = "fail"
 * 
 * @param object rsp
 */
PhotoSearch.prototype.showError = function(rsp) {
    var $results = $("<p>")
        .text("flickr Error("+ rsp.code +"): "+ rsp.message);
    
    $('#results').html($results);
}

$(document).ready(function() {
    //Sharing var so checks can be run on #next-result.click()
    var ps;
    
    /*
     * Calls Constructor fn for PhotoSearch, then calls runSearch()
     * 
     * @param string query
     */
    function newSearch(query) {
        ps = new PhotoSearch(query);
        
        runSearch();
    }

    /*
     * Uses PhotoSearch obj to call Ajax fn
     * - Promise ensures a good response comes back from API
     *   before calling next functions
     */
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

    //#next-results begins pagination search call on click
    $('#next-results').on('click', function() {
        if(ps === undefined) {
            return;
        }
        if(ps.paging.page < ps.paging.pages) {
            runSearch();
        }
    });

    //Submit btn that triggers a new search on click
    $('#flickr_search').on('click', function() {
        var query = $('#flickr_query').val();
        newSearch(query);
    });
    
    //Input searchbox that triggers a new search on enter
    $('#flickr_query').on('keyup', function(e) {
        if (e.keyCode === 13) {
            var query = $(this).val();
            newSearch(query);
        }
    });
    
    //sets up event listener for thumbnails as they are dynamically loaded
    //thumnail click triggers opening of Modal
    $('#results').on('click', '.thumbnail', function() {
        var oSrc = this.dataset['fullSize'];
        var $img = $('<img>')
            .attr('src', oSrc);

        $('#fullSize').html($img);
        $('#modal').addClass('show');
         
    });

    //Modal will close on click anywhere inside
    $('#modal').on('click', function() {
        $(this).removeClass('show');
    });
});
