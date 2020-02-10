'use strict';

var planOutputs = angular.module('planOutputs', []).directive('planOutputs', function () {
  return {
    link: function link(scope, element, attrs) {
      scope.planOutputsHTML = function () {
        var path = {};
        path.url = "modules/view/planOutputs/planOutputs.template.html";
        return path.url;
      };
    },
    restrict: 'A',
    template: '<div ng-include="planOutputsHTML()"></div>'
  };
}).controller('planOutputsCtrl', function ($scope, $rootScope, $route, $location, restService, loaderService, alertService) {
  $scope.plan = '';
  $scope.outputData = {};
  $scope.loaded = {
    outputData: false
  };
  $scope.savePlanData = {};
  $scope.savePlanModalShown = false;
  $scope.init = init;
  $scope.savePlan = savePlan;
  $scope.savePlan_submit = savePlan_submit;
  $scope.savePlan_close = savePlan_close;
  $scope.downloadPlan = downloadPlan;
  $scope.numberWithCommas = numberWithCommas;

  function downloadPlan(data) {
    var d = JSON.parse(JSON.stringify(data));
    var tab1 = [[], []]; // let tab1 = d.summary_metrics;

    for (var k in d.summary_metrics) {
      if (k.indexOf('_disp') != -1) {
        delete d.summary_metrics[k];
      } else {
        tab1[0].push(k);
        tab1[1].push(d.summary_metrics[k]);
      }
    }

    var tab2 = d.plan_details;
    var csvContent1 = "data:text/csv;charset=utf-8," + tab1.map(function (e) {
      return e.join(",");
    }).join("\n");
    var csvContent2 = "data:text/csv;charset=utf-8," + tab2.map(function (e) {
      return e.join(",");
    }).join("\n");
    var today = new Date();
    alertService.createAlert('success', 'Downloading the output data as two .csv files', 5000);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = encodeURI(csvContent1);
    hiddenElement.target = '_blank';
    hiddenElement.download = d.id + '_summaryMetrics' + today.toString() + '.csv';
    hiddenElement.click();
    var hiddenElement2 = document.createElement('a');
    hiddenElement2.href = encodeURI(csvContent2);
    hiddenElement2.target = '_blank';
    hiddenElement2.download = d.id + '_planDetails' + today.toString() + '.csv';
    hiddenElement2.click();
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function savePlan(outputData) {
    console.log(outputData);
    $scope.savePlanData = {
      'plan_outputs_id': outputData.id,
      'plan_inputs_id': outputData.plan_inputs_id
    };
    $scope.savePlanData['title'] = '';
    $scope.savePlanModalShown = true;
  }

  function savePlan_close() {
    $scope.savePlanData = {};
    $scope.savePlanModalShown = false;
    $scope.$apply();
  }

  function savePlan_submit() {
    loaderService.createLoader('Saving Your Plan');
    var now = new Date();
    $scope.savePlanData['created'] = JSON.stringify(now);
    $scope.savePlanData['modified'] = JSON.stringify(now);
    $scope.savePlanData['created_by'] = 'temp_user';
    restService.savePlan($scope.savePlanData).then(function (data) {
      console.log(data);
      savePlan_close();

      if (data.statusCode === 200) {
        loaderService.removeLoader('Saved');
        alertService.createAlert('success', 'Your plan was successfully saved!', 3000);
      } else if (data.statusCode === 208) {
        loaderService.removeLoader('Plan is already Saved');
        alertService.createAlert('warning', 'This plan was already saved', 3000);
      }
    })["catch"](function (err) {
      loaderService.removeLoader();
      alertService.createServerError();
      console.error(err);
    });
  }

  function init() {
    loaderService.createLoader();
    console.log('planOutputs module');

    if (JSON.stringify($route.current.params).length > 2) {
      for (var key in $route.current.params) {
        try {
          $scope.outputData = JSON.parse(key);
          var total = 0;
          $scope.outputData.plan_details.forEach(function (row, idx, arr) {
            if (idx < arr.length - 1 && idx > 0) {
              total += parseFloat(row[row.length - 1]);
            }
          });
          $scope.outputData.plan_details[$scope.outputData.plan_details.length - 1].push(total);
          console.log($scope.outputData);

          for (var _key in $scope.outputData.summary_metrics) {
            $scope.outputData.summary_metrics[_key + '_disp'] = numberWithCommas($scope.outputData.summary_metrics[_key]);
          }

          $scope.outputData.plan_details_disp = [];
          $scope.outputData.plan_details.forEach(function (row) {
            var row_disp = [];
            row.forEach(function (col) {
              var col_disp = numberWithCommas(col);
              row_disp.push(col_disp);
            });
            $scope.outputData.plan_details_disp.push(row_disp);
          });
          $scope.loaded.outputData = true;
          loaderService.removeLoader();
        } catch (err) {
          console.log(err);
        }
      }

      ;
    } else {
      console.log('no parameters');
      loaderService.removeLoader();
      $location.path('/');
    }
  }

  init();
});