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
  $scope.savePlanModalShown = false; // --- currently hard coded - needs to be dynamically updated

  $scope.monthlyDistribution = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $scope.quarterlyDistribution = ['Q1', 'Q2', 'Q3', 'Q4'];
  $scope.regions = ['All', 'Region 1', 'Region 2', 'Region 3', 'Region 4', 'Region 5', 'Region 6', 'Region 7'];
  $scope.regionSelected = 'All';
  $scope.chartDisplayType = 'FTE';
  $scope.chartDisplayTimeframe = '12';
  $scope.chartTitle = '';
  $scope.chartDataSeries = [];
  $scope.myChart = echarts.init(document.getElementById('myChart'));
  $scope.chartData = {
    title: {
      text: '',
      right: 300,
      top: 20,
      textAlign: 'center'
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      // top: 40,
      bottom: 0,
      left: 210,
      // orient: 'vertical',
      backgroundColor: '#FFFFFF'
    },
    xAxis: {
      data: $scope.monthlyDistribution
    },
    yAxis: {},
    grid: {
      left: 210
    }
  };
  $scope.init = init;
  $scope.savePlan = savePlan;
  $scope.savePlan_submit = savePlan_submit;
  $scope.savePlan_close = savePlan_close;
  $scope.downloadPlan = downloadPlan;
  $scope.numberWithCommas = numberWithCommas;
  $scope.generateChart = generateChart;
  $scope.changeChartTimeframe = changeChartTimeframe;
  $scope.updateChart = updateChart;

  function updateChart() {
    $scope.chartData.series = $scope.chartDataSeries.map(function (i) {
      // ---if chosen to be displayed
      if (i.displayed) {
        // TODO --- if region selected
        if ($scope.regionSelected !== 'All') {
          if (i.location === $scope.regionSelected) {
            return i;
          } else {
            return;
          }
        } else {
          return i;
        }
      } else {
        return;
      }
    });
    var option = $scope.chartData;
    $scope.myChart.setOption(option, true);
  }

  function changeChartTimeframe(dir) {
    if (dir === 'plus' && $scope.chartDisplayTimeframe === '12') {
      $scope.chartDisplayTimeframe = '4';
      generateChart();
    } else if (dir === 'plus' && $scope.chartDisplayTimeframe === '4') {
      console.log('nochange');
    } else if (dir === 'minus' && $scope.chartDisplayTimeframe === '12') {
      console.log('nothing');
    } else if (dir === 'minus' && $scope.chartDisplayTimeframe === '4') {
      $scope.chartDisplayTimeframe = '12';
      generateChart();
    }
  }

  function generateChart() {
    // --- kinda hard coded, kinda dynamic - will need to sort out the filters foro geography
    // 
    var currentData = JSON.parse(JSON.stringify($scope.outputData.graphicalDisplayData[$scope.chartDisplayType]));
    currentData.forEach(function (val, idx, arr) {
      var split = (val.data / $scope.chartDisplayTimeframe).toFixed(2);
      var newDataArr = [];

      for (var i = 0; i < $scope.chartDisplayTimeframe; i++) {
        newDataArr.push(split);
      }

      ;
      currentData[idx].data = newDataArr;
      currentData[idx].type = 'bar';
      currentData[idx].label = {
        show: true,
        rotate: 90,
        position: 'insideLeft'
      }; // if (currentData[idx].displayed) {}
      // currentData[idx].displayed = true;

      if (parseFloat($scope.chartDisplayTimeframe) < 12) {
        $scope.chartTitle = 'Quartly Distribution'; // $scope.chartData.title.text = 'Quartly Distribution';

        $scope.chartData.xAxis.data = $scope.quarterlyDistribution;
      } else {
        $scope.chartTitle = 'Monthly Distribution'; // $scope.chartData.title.text = 'Monthly Distribution';

        $scope.chartData.xAxis.data = $scope.monthlyDistribution;
      }
    });
    $scope.chartDataSeries = currentData;
    $scope.chartData.series = $scope.chartDataSeries.map(function (i) {
      // ---if chosen to be displayed
      if (i.displayed) {
        // TODO --- if region selected
        if ($scope.regionSelected !== 'All') {
          if (i.location === $scope.regionSelected) {
            return i;
          } else {
            return;
          }
        } else {
          return i;
        }
      } else {
        return;
      }
    });
    var option = $scope.chartData;
    $scope.myChart.setOption(option, true);
  }

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

  function generateListeners() {
    window.addEventListener('resize', function () {
      $scope.myChart.resize();
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
          loaderService.removeLoader(); // $scope.chartDataSeries = $scope.outputData.graphicalDisplayData[$scope.chartDisplayType];

          $scope.outputData.graphicalDisplayData.FTE.forEach(function (i) {
            i.displayed = true;
          });
          $scope.outputData.graphicalDisplayData.AI.forEach(function (i) {
            i.displayed = true;
          });
          generateChart();
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

  generateListeners();
  init();
});