'use strict';

var testView = angular.module('testView', [])
.directive('testView', function () {
    return {
        link: function (scope, element, attrs) {
            scope.testViewHTML = function () {
                var path = {};
                path.url = "modules/view/testView/testView.template.html";
                
                return path.url;
            }
        },
        restrict: 'A',
        template: '<div ng-include="testViewHTML()"></div>'
    };
})
.controller('testViewCtrl', function ($scope, $rootScope) {

    $scope.boards = []

    function init() {
        console.log('testView module')

    }

    init();

});