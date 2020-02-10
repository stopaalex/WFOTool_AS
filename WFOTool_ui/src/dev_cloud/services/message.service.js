"use strict";

var messageService = angular.module('messageService', []).service('messageService', function ($rootScope) {
  var messageService = this;

  this.broadcastMessage = function (msg, data) {
    $rootScope.$broadcast(msg, data);
  };
});