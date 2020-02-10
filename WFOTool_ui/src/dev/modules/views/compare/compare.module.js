'use strict';

var compare = angular.module('compare', [])
    .directive('compare', function () {
        return {
            link: function (scope, element, attrs) {
                scope.compareHTML = function () {
                    var path = {};
                    path.url = "modules/view/compare/compare.template.html";

                    return path.url;
                }
            },
            restrict: 'A',
            template: '<div ng-include="compareHTML()"></div>'
        };
    })
    .controller('compareCtrl', function ($scope, $rootScope, $route, restService, loaderService, alertService) {

        $scope.plansToCompare = [
            {},
            {},
            {}
        ];
        $scope.plansSelected = [];
        $scope.indicators = {};
        $scope.planOptions = [];

        $scope.init = init;
        $scope.getSavedPlans = getSavedPlans;
        $scope.getComparedPlan = getComparedPlan;
        $scope.numberWithCommas = numberWithCommas;
        $scope.generateIndicators = generateIndicators;

        function generateIndicators(plans) {
            // TODO --- I genuinely don't know if this is actually going tgo work but we shall see
            if (plans.length > 1) {
                $scope.indicators.max_revenue = Math.max(...plans.map(d => +d.summary_metrics.revenue).filter(p => !isNaN(p)));
                $scope.indicators.max_cost = Math.max(...plans.map(d => +d.summary_metrics.cost).filter(p => !isNaN(p)));
                $scope.indicators.max_roi_percent = Math.max(...plans.map(d => +d.summary_metrics.roi_percent).filter(p => !isNaN(p)));
                $scope.indicators.max_success_rate = Math.max(...plans.map(d => +d.summary_metrics.success_rate).filter(p => !isNaN(p)));
                let nums = {
                    rev: 0,
                    cost: 0,
                    roi: 0,
                    suc: 0
                }
                plans.forEach((p, i, a) => {
                    if (p.summary_metrics.revenue == $scope.indicators.max_revenue) {nums.rev++}
                    if (p.summary_metrics.cost == $scope.indicators.max_cost) {nums.cost++}
                    if (p.summary_metrics.roi_percent == $scope.indicators.max_roi_percent) {nums.roi++}
                    if (p.summary_metrics.success_rate == $scope.indicators.max_success_rate) {nums.suc++}
                });
                if (nums.rev === plans.length) {$scope.indicators.max_revenue = ''}
                if (nums.cost === plans.length) {$scope.indicators.max_cost = ''}
                if (nums.roi === plans.length) {$scope.indicators.max_roi_percent = ''}
                if (nums.suc === plans.length) {$scope.indicators.max_success_rate = ''}

                $scope.$apply();
            }
        }

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function getComparedPlan(idx, plan) {
            loaderService.createLoader('Selecting plan to compare to...');
            restService.getOutputsByInputId({ 'plan_inputs_id': JSON.parse(plan).plan_inputs_id })
                .then(data => {
                    loaderService.removeLoader();
                    $scope.plansSelected[idx] = data.body.Items[0];
                    for (let key in $scope.plansSelected[idx].summary_metrics) {
                        $scope.plansSelected[idx].summary_metrics[key + '_disp'] = numberWithCommas($scope.plansSelected[idx].summary_metrics[key]);
                    }
                    $scope.$apply();

                    generateIndicators($scope.plansSelected);
                })
                .catch(err => {
                    // console.warn(err);
                    loaderService.removeLoader();
                    alertService.createServerError();

                    console.error(err);
                });
        }

        function getSavedPlans() {
            loaderService.createLoader('Loading');
            restService.getSavedPlans()
                .then(data => {
                    try {

                        $scope.planOptions = data.body.Items;

                        $scope.planOptions.sort((a, b) => {
                            if (a.title > b.title) {
                                return 1;
                            } else if (a.title < b.title) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });

                        $scope.$apply();
                        loaderService.removeLoader();

                    } catch (error) {
                        console.error(error);
                        loaderService.removeLoader();
                        $scope.$apply();
                    }
                })
                .catch(err => {
                    // console.warn(err);
                    loaderService.removeLoader();
                    alertService.createServerError();

                    console.error(err);
                })
        }

        function init() {
            console.log('compare module');

            getSavedPlans();
        }

        init();

    });