'use strict';

var testComponent = angular.module('testComponent', []).directive('testComponent', function () {
  return {
    link: function link(scope, element, attrs) {
      scope.testComponentHTML = function () {
        var path = {};
        path.url = "modules/components/testComponent/testComponent.template.html";
        return path.url;
      };
    },
    restrict: 'A',
    template: '<div ng-include="testComponentHTML()"></div>'
  };
}).controller('testComponentCtrl', function ($scope, $rootScope) {
  $scope.data = {};
  $scope.data.distance = 0;
  $scope.data.speed = 0;
  $scope.data.tank_size = 0;
  $scope.testReturnData;
  $scope.init = init;
  $scope.testRest = testRest;

  function testRest(paramObj) {
    var testAjax = $.ajax({
      url: 'https://6w0kmteji2.execute-api.us-east-1.amazonaws.com/test/test_WFOTravelMath',
      type: 'GET',
      data: paramObj,
      contentType: "application/json",
      success: function success(data) {
        console.log(data);
        $scope.testReturnData = data.body;
        $scope.$apply();
      },
      failure: function failure(err) {
        return err;
      }
    });
  }

  function init() {
    console.log('testComponent module');
  }

  init();
});