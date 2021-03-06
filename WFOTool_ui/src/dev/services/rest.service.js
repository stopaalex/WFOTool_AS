var restService = angular.module('restService', [])
    .service('restService', function ($rootScope) {

        var restService = this;

        this.runPlan = function(data) {
            // test ajax call to separate local server
            var testAjax = $.ajax({
                url: 'http://localhost:1000/run-plan',
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: d => {
                    return d;
                },
                failure: err => {
                    console.warn(err);
                    return err;
                }
            });
            return testAjax;
        };
        
        this.savePlan = function(data) {
            var savePlanAjax = $.ajax({
                url: 'http://localhost:1000/save-plan',
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: d => {
                    return d;
                },
                failure: err => {
                    console.warn(err);
                    return err;
                }
            });
            return savePlanAjax;
        }

        this.getDefaultPlan = function() {
            var getDefaultPlanAjax = $.ajax({
                url: 'http://localhost:1000/get-default-inputs',
                type: 'GET',
                data: {id:'61761d46-06ed-11ea-bfb8-d8f2ca4be654'},
                contentType: "application/json",
                success: d => {
                    return d;
                },
                failure: err => {console.log(err)}
            });

            return getDefaultPlanAjax
        }

        this.getSavedPlans = function(data) {
            var getDefaultPlanAjax = $.ajax({
                url: 'http://localhost:1000/get-saved-plans',
                type: 'GET',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: d => {
                    return d;
                },
                failure: err => {console.log(err)}
            });

            return getDefaultPlanAjax
        }

        /**
         * pulls from plan_outputs
         */
        this.getOutputsByInputId = function(data) {
            var getDefaultPlanAjax = $.ajax({
                url: 'http://localhost:1000/get-output-plans',
                type: 'GET',
                data: data,
                contentType: "application/json",
                success: d => {
                    return d;
                },
                failure: err => {console.log(err)}
            });

            return getDefaultPlanAjax
        }

    });