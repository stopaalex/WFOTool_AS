'use strict';

var navigationComponent = angular.module('navigationComponent', []).directive('navigationComponent', function () {
  return {
    link: function link(scope, element, attrs) {
      scope.navigationComponentHTML = function () {
        var path = {};
        path.url = "modules/components/navigationComponent/navigationComponent.template.html";
        return path.url;
      };
    },
    restrict: 'A',
    template: '<div ng-include="navigationComponentHTML()"></div>'
  };
}).controller('navigationComponentCtrl', function ($scope, $rootScope, $route, $location, messageService) {
  $scope.path = '';
  $scope.pathParams = {
    step: ''
  };
  $scope.init = init;
  $scope.generateListeners = generateListeners;
  $scope.initiateFirstNav = initiateFirstNav;
  $scope.navigateTo = navigateTo;

  function navigateTo(loc) {
    if (loc === 'home' || loc === 'output' || loc === 'compare') {
      $location.path(loc);
      $scope.pathParams.step = '';
    } else {
      if ($route.current.$$route.originalPath.indexOf('input') === -1) {
        $location.path('input');
        setTimeout(function () {
          messageService.broadcastMessage('changeStep', {
            step: loc
          });
        }, 500);
      } else {
        messageService.broadcastMessage('changeStep', {
          step: loc
        });
      }
    }
  }

  function initiateFirstNav() {
    $scope.path = $route.current.$$route.originalPath.replace('/', '');

    if ($route.current.params.step) {
      $scope.pathParams.step = $route.current.params.step;
    } else {
      $scope.pathParams.step = '';
    }
  }

  function generateListeners() {
    // route change listener
    $scope.$on('$routeChangeSuccess', function ($event, next, current) {
      $scope.path = next.$$route.originalPath.replace('/', '');

      if (next.params.step) {
        $scope.pathParams.step = next.params.step;
      } else {
        $scope.pathParams.step = '';
      }
    }); // === updating the search parameters for the steps

    $scope.$on('changeStep', function ($event, data) {
      if (data) {
        $scope.pathParams.step = data.step;
      } else {
        $scope.pathParams.step = '';
      }

      if (window.location.hash.indexOf('?') !== -1) {
        window.location.hash = window.location.hash.split('?')[0] + '?step=' + data.step;
      } else {
        window.location.hash = window.location.hash + '?step=' + data.step;
      }

      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  }

  function init() {
    console.log('navigationComponent module');
    generateListeners();
    initiateFirstNav();
  }

  init();
});