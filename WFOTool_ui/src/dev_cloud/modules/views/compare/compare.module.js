'use strict';

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var compare = angular.module('compare', []).directive('compare', function () {
  return {
    link: function link(scope, element, attrs) {
      scope.compareHTML = function () {
        var path = {};
        path.url = "modules/view/compare/compare.template.html";
        return path.url;
      };
    },
    restrict: 'A',
    template: '<div ng-include="compareHTML()"></div>'
  };
}).controller('compareCtrl', function ($scope, $rootScope, $route, restService, loaderService, alertService) {
  $scope.plansToCompare = [{}, {}, {}];
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
      $scope.indicators.max_revenue = Math.max.apply(Math, _toConsumableArray(plans.map(function (d) {
        return +d.summary_metrics.revenue;
      }).filter(function (p) {
        return !isNaN(p);
      })));
      $scope.indicators.max_cost = Math.max.apply(Math, _toConsumableArray(plans.map(function (d) {
        return +d.summary_metrics.cost;
      }).filter(function (p) {
        return !isNaN(p);
      })));
      $scope.indicators.max_roi_percent = Math.max.apply(Math, _toConsumableArray(plans.map(function (d) {
        return +d.summary_metrics.roi_percent;
      }).filter(function (p) {
        return !isNaN(p);
      })));
      $scope.indicators.max_success_rate = Math.max.apply(Math, _toConsumableArray(plans.map(function (d) {
        return +d.summary_metrics.success_rate;
      }).filter(function (p) {
        return !isNaN(p);
      })));
      var nums = {
        rev: 0,
        cost: 0,
        roi: 0,
        suc: 0
      };
      plans.forEach(function (p, i, a) {
        if (p.summary_metrics.revenue == $scope.indicators.max_revenue) {
          nums.rev++;
        }

        if (p.summary_metrics.cost == $scope.indicators.max_cost) {
          nums.cost++;
        }

        if (p.summary_metrics.roi_percent == $scope.indicators.max_roi_percent) {
          nums.roi++;
        }

        if (p.summary_metrics.success_rate == $scope.indicators.max_success_rate) {
          nums.suc++;
        }
      });

      if (nums.rev === plans.length) {
        $scope.indicators.max_revenue = '';
      }

      if (nums.cost === plans.length) {
        $scope.indicators.max_cost = '';
      }

      if (nums.roi === plans.length) {
        $scope.indicators.max_roi_percent = '';
      }

      if (nums.suc === plans.length) {
        $scope.indicators.max_success_rate = '';
      }

      $scope.$apply();
    }
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function getComparedPlan(idx, plan) {
    loaderService.createLoader('Selecting plan to compare to...');
    restService.getOutputsByInputId({
      'plan_inputs_id': JSON.parse(plan).plan_inputs_id
    }).then(function (data) {
      loaderService.removeLoader();
      $scope.plansSelected[idx] = data.body.Items[0];

      for (var key in $scope.plansSelected[idx].summary_metrics) {
        $scope.plansSelected[idx].summary_metrics[key + '_disp'] = numberWithCommas($scope.plansSelected[idx].summary_metrics[key]);
      }

      $scope.$apply();
      generateIndicators($scope.plansSelected);
    })["catch"](function (err) {
      // console.warn(err);
      loaderService.removeLoader();
      alertService.createServerError();
      console.error(err);
    });
  }

  function getSavedPlans() {
    loaderService.createLoader('Loading');
    restService.getSavedPlans().then(function (data) {
      try {
        $scope.planOptions = data.body.Items;
        $scope.planOptions.sort(function (a, b) {
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
    })["catch"](function (err) {
      // console.warn(err);
      loaderService.removeLoader();
      alertService.createServerError();
      console.error(err);
    });
  }

  function init() {
    console.log('compare module');
    getSavedPlans();
  }

  init();
});