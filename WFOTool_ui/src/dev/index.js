"use strict";

var WFOTool = angular.module('WFOTool', [
    'ngRoute',
    'navigationComponent',
    'planInputs',
    'planOutputs',
    'compare',
    'home',
    'testView',
    'testComponent',
    'messageService',
    'restService',
    'loaderService',
    'conflictService',
    'alertService'
]);

WFOTool.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'modules/views/home/home.template.html'
    })
    .when('/home', {
        templateUrl: 'modules/views/home/home.template.html'
    })
    .when('/input', {
        templateUrl: 'modules/views/planInputs/planInputs.template.html',
        reloadOnSearch: false
    })
    .when('/output', {
        templateUrl: 'modules/views/planOutputs/planOutputs.template.html'
    })
    // .when('/output/:plan', {
    //     templateUrl: 'modules/views/planOutputs/planOutputs.template.html'
    // })
    .when('/compare', {
        templateUrl: 'modules/views/compare/compare.template.html'
    })
    .when('/test', {
        templateUrl: 'modules/views/testView/testView.template.html'
    })
    // potential to sue: but if you're comparing an unknown number of plans, maybe not
    // .when('/compare/:planOne/:planTwo', {
    //     templateUrl: 'modules/views/compare/compare.template.html'
    // })
    .otherwise('/')
});

WFOTool.controller('WFOToolCtrl', function($scope, $rootScope, $location, loaderService) {
    
    $rootScope.workingPlan = {};

    $scope.init = init;

    function init() {
        loaderService.removeLoader();
    }

    init();

})