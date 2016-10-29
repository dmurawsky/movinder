(function() {

  var lastPage = 0;
  var currentHash;
  // Call the weather API
  init(function(resp){
    document.cookie = 'uuid='+resp.uuid;
    window.UUID = resp.uuid;
    hashChange();
  });

  document.getElementById("searchForm").onsubmit = function(e) { updateHash(e); };

  setInterval(searchInterval,1000);

  // Function to initialize the app and get the users unique ID
  function init(cb){
    getUuid(cb);
  }

  // Function to encode the search string as a url encoded search query
  function searchEncode(string){
    var out = string.replace(/ /g, '+'); // Replaces all spaces with a plus sign
    return out.replace(/\W/g, ''); // Removes all non-alphanumeric characters
  }

  // Function to decode the hash to make it human readable again
  function searchDecode(query){
    var trimmed = query.slice(1);
    var arr = trimmed.split("&");
    for (var i=0; i<arr.length; i++){
      var arr2 = arr[i].split("=");
      if(arr2[0]="s")
        return arr2[1].replace(/\+/g, ' ');
    }
  }

  // Function to update the hash on based on the search string
  function updateHash(e){
    e.preventDefault();
    var search = document.getElementById("searchInput").value;
    if (search.length>1){
      var query = search.replace(/ /g, '+');
      query = search.replace(/\W/g, '');
      var obj = {s:query};
      var queryString = getQueryString(obj);
      if(history.pushState){
        history.pushState(null, null, '#'+queryString);
        hashChange();
      } else {
        location.hash = '#'+queryString;
        hashChange();
      }
    }
  }

  // Function to convert a JavaScript Ojbect into a query string for the API
  function getQueryString(obj){
    var keys = Object.keys(obj);
    var str = "";
    for (var i=0; i<keys.length; i++){
      if (obj[keys[i]]){
        if (i>0)
          str += "&";
        str += keys[i] + "=" + obj[keys[i]];
      }
    }
    return str;
  }

  function loading(hide){
    document.getElementById("loading").style.display = (hide?"none":"block");
  }

  // Creates and calls the XHR, then calls the callback
  function ajax(url, cb) {
    try {
      var x = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
      x.open('GET', url, 1);
      x.onreadystatechange = function () {
        x.readyState > 3 && cb && cb(JSON.parse(x.responseText), x);
      };
      x.send()
    } catch (e) {;
      window.console && console.log(e);
    }
  }

  // Hides the detail page and shows the home page
  function homePage(hide){
    document.getElementById("homepage").style.display = (hide?"none":"block");
  }

  // Function to create and append movie elements to the homepage
  function listMovies(arr){
    if (arr){
      for(var i = 0; i < arr.length; i++) {
        var movie = document.createElement("DIV");
        movie.setAttribute("id", arr[i].imdbID);
        movie.innerHTML = movieString(arr[i]);
        document.getElementById("homepage").appendChild(movie);
      }
    }
  }

  // Clears the list of movies
  function clearMovies(){
    document.getElementById("homepage").innerHTML = "";
  }

  // Function to take the movie details and return a string of html to be written to the DOM
  function movieString(details){
    var str = `
    <div class="col-md-3">
      <div class="movie">`;
        if (details.Poster !== "N/A") str += `<img src="`+details.Poster+`" />`;
        str += `<div class="details">
          <h1>`+details.Title+`</h1>
          <h2>`+details.Type+`</h2>
          <h3>`+details.Year+`</h3>
        </div>
      </div>
    </div>
    `;
    return str;
  }

  // Function to check cookies for unique identifier
  // If it doesn't exist, query the server for one and save it as a cookie
  function getUuid(cb) {
    var cookie = document.cookie;
    var key = "uuid=";
    if(!cookie.includes(key)){
      ajax("/uuid", cb);
      return;
    }
    var arr = document.cookie.split(';');
    for(var i = 0; i < arr.length; i++) {
      var c = arr[i];
      while (c.charAt(0)==' ')
        c = c.substring(1);
      if (c.indexOf(key) == 0){
        var uuid = c.substring(key.length,c.length);
        cb({uuid:uuid});
        return;
      }
    }
  }

  function hashChange() {
    var hash = window.location.hash.slice(1);
    if(hash)
      document.getElementById("searchInput").value = searchDecode(hash);
  }

  function loadResults(hash, page){
    if (hash){
      ajax("https://www.omdbapi.com/?"+hash+"&page="+(lastPage>1?lastPage:1),function(resp){
        listMovies(resp.Search);
        homePage();
      });
    }else{

    }
  }

  function searchInterval(){
    var hash = window.location.hash.slice(1);
    if (hash.length>1 && currentHash == hash){
      var body = document.body;
      var html = document.documentElement;
      var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      var scrollTop = Math.max(html.scrollTop, body.scrollTop);
      if (scrollTop+window.innerHeight > (height - 50)){
        lastPage++;
        loadResults(hash);
      }
    }else{
      lastPage = 0;
      currentHash = hash;
      homePage(true);
      clearMovies();
    }
  }
})();
