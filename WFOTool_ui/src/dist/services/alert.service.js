"use strict";

var alertService = angular.module('alertService', []).service('alertService', function ($rootScope) {
  var alertService = this;
  /**
   * 
   * @param {string} type success, warning, or failure
   * @param {strring} msg the string foro teh alert
   * @param {number} timer the length the alert stays up
   */

  alertService.createAlert = function (type, msg, timer) {
    //
    // --- TYPES OF ALERTS
    var typesofalerts = ['success', 'warning', 'failure'];
    var alertContainer = document.getElementById('__alert');
    var randID = Math.floor(Math.random() * 10000 + 1);
    var closeAlert = '<button class="alert-close" onclick="document.getElementById(\'' + randID + '\').parentNode.removeChild(document.getElementById(\'' + randID + '\'))"><i class="fa fa-times"></i></button>';
    var newAlertHTML = '\
            <div id="' + randID + '" class="alert ' + type + '">\
                <div class="msg">' + msg + '</div>\
                <div class="close">' + closeAlert + '</div>\
            </div>\
            ';
    alertContainer.innerHTML += newAlertHTML;
    setTimeout(function () {
      alertService.fadeoutAlert(randID);
      setTimeout(function () {
        alertService.deleteAlert(randID);
      }, 250);
    }, timer);
  };

  alertService.createServerError = function (msg) {
    var alertContainer = document.getElementById('__alert');
    var randID = Math.floor(Math.random() * 10000 + 1);
    var timer = 100000000;
    var closeAlert = '<button class="alert-close" onclick="document.getElementById(\'' + randID + '\').parentNode.removeChild(document.getElementById(\'' + randID + '\'))"><i class="fa fa-times"></i></button>';
    var newAlertHTML = '';

    if (msg) {
      newAlertHTML = '\
                <div id="' + randID + '" class="alert ' + 'failure' + '">\
                    <div class="msg">' + 'ERROR: A server error has occured' + '</div>\
                    <div class="msg">' + msg + '</div>\
                    <div class="close">' + closeAlert + '</div>\
                </div>\
                ';
    } else {
      newAlertHTML = '\
                <div id="' + randID + '" class="alert ' + 'failure' + '">\
                    <div class="msg">' + 'ERROR: An unknown server error has occured' + '</div>\
                    <div class="msg">' + '-' + '</div>\
                    <div class="msg">' + 'Please refresh your browser' + '</div>\
                    <div class="close">' + closeAlert + '</div>\
                </div>\
                ';
    }

    alertContainer.innerHTML += newAlertHTML;
    setTimeout(function () {
      alertService.fadeoutAlert(randID);
      setTimeout(function () {
        alertService.deleteAlert(randID);
      }, 250);
    }, timer);
  };

  alertService.fadeoutAlert = function (id) {
    if (document.getElementById(id)) {
      var alert = document.getElementById(id);
      alert.classList.add('fade-out');
    }
  };

  alertService.deleteAlert = function (id) {
    if (document.getElementById(id)) {
      document.getElementById(id).parentNode.removeChild(document.getElementById(id));
    }
  };
});