"use strict";

var loaderService = angular.module('loaderService', []).service('loaderService', function ($rootScope) {
  var loaderService = this;

  this.createLoader = function (msg) {
    document.getElementById('wfoLoader').style.display = 'block';
    clearTimeout($rootScope.LoaderTimeout);
    var loaderHTML = '<div class="loader">\
                    <svg class="circular"\
                        viewBox="25 25 50 50">\
                        <circle class="path loading"\
                            cx="50" cy="50" r="20"\
                                fill="none"\
                                stroke-width="2"\
                                stroke-miterlimit="10" />\
                    </svg>\
            </div>';
    var text = '';

    if (msg) {
      text = msg;
    } else {
      text = 'Loading . . .';
    }

    var ani = document.getElementById('wfoLoaderShowbox');
    var txt = document.getElementById('wfoLoaderTextbox');
    ani.innerHTML = loaderHTML;
    txt.textContent = text;
  };

  this.removeLoader = function (msg) {
    $rootScope.LoaderTimeout = setTimeout(function () {
      var loadedHTML = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2" class="ld">\
                    <circle class="path circle" fill="none" stroke="#73AF55" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>\
                    <polyline class="path check" fill="none" stroke="#73AF55" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>\
                </svg>';
      var ani = document.getElementById('wfoLoaderShowbox');
      var txt = document.getElementById('wfoLoaderTextbox');
      var loadedText = '';

      if (msg) {
        if (msg.length > 0) {
          loadedText = 'Loaded';
        } else {
          loadedText = msg;
        }
      } else {
        loadedText = msg;
      }

      ani.innerHTML = loadedHTML;
      txt.textContent = loadedText;
      setTimeout(function () {
        document.getElementById('wfoLoader').classList.add('fadeout');
        setTimeout(function () {
          var ani = document.getElementById('wfoLoaderShowbox');
          var txt = document.getElementById('wfoLoaderTextbox');
          ani.innerHTML = '';
          txt.textContent = '';
          document.getElementById('wfoLoader').style.display = 'none';
          document.getElementById('wfoLoader').classList.remove('fadeout');
        }, 250);
      }, 400);
    }, 300);
  };
});