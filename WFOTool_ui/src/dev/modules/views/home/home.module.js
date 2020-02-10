'use strict';

var home = angular.module('home', [])
.directive('home', function () {
    return {
        link: function (scope, element, attrs) {
            scope.homeHTML = function () {
                var path = {};
                path.url = "modules/view/home/home.template.html";
                
                return path.url;
            }
        },
        restrict: 'A',
        template: '<div ng-include="homeHTML()"></div>'
    };
})
.controller('homeCtrl', function ($scope, $rootScope) {


    $scope.init = init;

    function init() {
        console.log('home module')

    }

    init();

});