'use strict';

var planInputs = angular.module('planInputs', [])
    .directive('planInputs', function () {
        return {
            link: function (scope, element, attrs) {
                scope.planInputsHTML = function () {
                    var path = {};
                    path.url = "modules/view/planInputs/planInputs.template.html";

                    return path.url;
                }
            },
            restrict: 'A',
            template: '<div ng-include="planInputsHTML()"></div>'
        };
    })
    .controller('planInputsCtrl', function ($scope, $rootScope, $location, messageService, $timeout, restService, loaderService, conflictService, alertService) {

        // === variables
        // step that the user is on 
        $scope.step = '';
        // available steps
        $scope.stepsArr = ['FTE', 'AvailableInventory', 'CaseConstraints', 'ResourceFlexibility'];
        // base inputData object
        $scope.inputData = {};
        $scope.inputData_rigid = {};
        $scope.validData = true;
        // the saved plans
        $scope.savedPlans = [];
        // FTE specific vars
        // modal boolean
        $scope.selectSavedPlanModalShown = false;
        $scope.selectedSavedPlan = {};
        $scope.selectSavedPlanModalPreviewShown = false;
        $scope.addWorkerModalShown = false;
        $scope.newWorker = { title: '', fte: 0, burnRate: 0 };
        $scope.deleteConstraintModalShown = false;
        $scope.constraintToDelete = {};
        $scope.deleteRuleModalShown = false;
        $scope.ruleToDelete = {};
        // AI specific vars
        //modal boolean
        $scope.addConstraintModalShown = false;
        $scope.newConstraint = { case_type: "", comparator: "", volume: 0 }
        $scope.addRuleModalShown = false;
        $scope.newRule = { comparator: "", percent: 0, worker: "", case_type: "" }
        $scope.comparators = {
            "be less than": "<",
            "not exceed": "<=",
            "equal": "=",
            "be more than": ">",
            "be at least": ">="
        }
        $scope.comparatorsDisp = {
            "be less than": "be less than",
            "not exceed": "not exceed",
            "equal": "equal",
            "be more than": "be more than",
            "be at least": "be at least"
        }
        $scope.flexiblityComparators = {
            "Less than": "<",
            "No more than": "<=",
            "Exactly": "=",
            "More than": ">",
            "At least": ">="
        }
        $scope.flexiblityComparatorsDisp = {
            "Less than": "Less than",
            "No more than": "No more than",
            "Exactly": "Exactly",
            "More than": "More than",
            "At least": "At least"
        }

        $scope.conflictObject = {};
        $scope.conflicts = [];

        // === functions
        $scope.init                           = init;
        $scope.generateListeners              = generateListeners;
        $scope.getPlans_default               = getPlans_default;
        $scope.getPlans_savedPlans            = getPlans_savedPlans;
        $scope.goToPrevStep                   = goToPrevStep;
        $scope.goToNextStep                   = goToNextStep;
        $scope.runnablePlan                   = runnablePlan;
        // validation funcs
        $scope.validateData                   = validateData;
        $scope.validateStep                   = validateStep;
        $scope.validateStep_arrows            = validateStep_arrows;
        //
        $scope.addWorkerType                  = addWorkerType;
        $scope.addWorkerType_submit           = addWorkerType_submit;
        $scope.addWorkerType_close            = addWorkerType_close;
        //
        $scope.addConstraint                  = addConstraint;
        $scope.addConstraint_submit           = addConstraint_submit;
        $scope.addConstraint_close            = addConstraint_close;
        // 
        $scope.addRule                        = addRule;
        $scope.addRule_submit                 = addRule_submit;
        $scope.addRule_close                  = addRule_close;
        // 
        $scope.deleteConstraint               = deleteConstraint;
        $scope.deleteConstraint_submit        = deleteConstraint_submit;
        $scope.deleteConstraint_close         = deleteConstraint_close;
        // 
        $scope.deleteRule                     = deleteRule;
        $scope.deleteRule_submit              = deleteRule_submit;
        $scope.deleteRule_close               = deleteRule_close;

        $scope.selectSavedPlan_open           = selectSavedPlan_open;
        $scope.selectSavedPlan_selectPlan     = selectSavedPlan_selectPlan;
        $scope.selectSavedPlan_previewPlan    = selectSavedPlan_previewPlan;
        $scope.selectSavedPlan_closePreview   = selectSavedPlan_closePreview;
        $scope.selectSavedPlan_uploadPlan     = selectSavedPlan_uploadPlan;
        $scope.selectSavedPlan_close          = selectSavedPlan_close;

        $scope.workersScroll_checkOverflow    = workersScroll_checkOverflow;
        $scope.workersScroll_scroll           = workersScroll_scroll;
        $scope.workersScroll_scrollHold       = workersScroll_scrollHold;
        $scope.workersScroll_scrollHoldUp     = workersScroll_scrollHoldUp;

        $scope.updateWorkingPlanSave          = updateWorkingPlanSave;

        $scope.runPlan                        = runPlan;

        
        /**
         * the scroll overflow checking foro the buttons
         */
        function workersScroll_checkOverflow() {
            let workers = document.getElementById('workers');
            if (workers) {
                if (workers.clientWidth - workers.scrollWidth < 0) {
                    return true;
                    ue;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }


        /**
         * actual scrolling functionality foro clicking
         * @param {string} dir left or righth
         * @param {number} int the number
         */
        function workersScroll_scroll(dir, int) {
            let distance = Number;
            if (!int) {
                distance = 40;
                if (dir === 'left') {
                    distance = -40;
                }
            } else {
                distance = int;
                if (dir === 'left') {
                    distance = -int;
                }
            }
            let ele = document.getElementById('workers');
            ele.scrollLeft = ele.scrollLeft + distance;
        }

        /**
         * holding the scroll 
         * @param {string} dir left or right
         */
        function workersScroll_scrollHold(dir) {
            $scope.scrollInterval = setInterval(() => {
                workersScroll_scroll(dir, 2);
            }, 1)
        }


        /**
         * releasing the scroll
         */
        function workersScroll_scrollHoldUp() {
            clearInterval($scope.scrollInterval);
        }


        function selectSavedPlan_open() {
            $scope.selectSavedPlanModalShown = true;
        }

        
        function selectSavedPlan_selectPlan(plan) {
            if ($scope.selectedSavedPlan) {
                if ($scope.selectedSavedPlan.id === plan.id) {
                    $scope.selectedSavedPlan = {};
                } else {
                    $scope.selectedSavedPlan = plan;
                }
            } else {
                $scope.selectedSavedPlan = plan;
            }
        }

        function selectSavedPlan_previewPlan() {
            $scope.selectSavedPlanModalPreviewShown = true;
        }

        function selectSavedPlan_closePreview() {
            $scope.selectSavedPlanModalPreviewShown = false;
        }

        function selectSavedPlan_uploadPlan(plan) {
            // TODO | better check
            if (JSON.stringify($scope.inputData) === JSON.stringify(plan)) {
                alertService.createAlert('warning', 'Plan Already Selected', 5000);
                // alert('plan already selected');
            } else {
                $scope.inputData_rigid = JSON.parse(JSON.stringify(plan));
                $scope.inputData = JSON.parse(JSON.stringify(plan));
                selectSavedPlan_close();
            }
        }

        function selectSavedPlan_close() {
            $scope.selectSavedPlanModalShown = false;
            $scope.selectedSavedPlan = {};
        }

        function addWorkerType() {
            $scope.addWorkerModalShown = true;
        }
        function addWorkerType_submit(newWorker) {
            //validate data exists
            let errors = [];
            for (let key in newWorker) {
                if (typeof newWorker[key] === 'string') {
                    if (newWorker[key].length < 1) {
                        errors.push('worker name cannot be blank');
                    } else {
                        // for (let )
                    }
                } else if (typeof newWorker[key] === 'number' && newWorker[key] < 1) {
                    errors.push(key + ' cannot be 0');
                }
            }
            if (errors.length > 0) {
                errors.forEach(err => {
                    // alert(err);
                    alertService.createAlert('failure', err, 10000);
                });
            } else {
                $scope.inputData.fte[newWorker.title] = JSON.parse(JSON.stringify(newWorker));
                addWorkerType_close();
            }
        }

        function addWorkerType_close() {
            $scope.addWorkerModalShown = false;
            $scope.newWorker.title = '';
            $scope.newWorker.fte = 0;
            $scope.newWorker.burnRate = 0;
        }

        function addConstraint() {
            $scope.addConstraintModalShown = true;
        }

        function addConstraint_submit(newConstraint) {
            let errors = [];
            for (let key in newConstraint) {
                if (typeof newConstraint[key] === 'string') {
                    if (newConstraint[key].length < 1) {
                        errors.push(key + ' cannot be blank');
                    } else {

                    }
                } else if (typeof newConstraint[key] === 'number' && newConstraint[key] < 1) {
                    errors.push(key + 'cannot be 0');
                }
            }
            if (errors.length > 0) {
                errors.forEach(err => {
                    // alert(err);
                    alertService.createAlert('failure', err, 10000);
                });
            } else {
                $scope.inputData.cc.constraints.push(JSON.parse(JSON.stringify(newConstraint)));
                addConstraint_close();
            }
        }

        function addConstraint_close() {
            $scope.addConstraintModalShown = false;
            $scope.newConstraint.case_type = "";
            $scope.newConstraint.comparator = "";
            $scope.newConstraint.volume = 0;
        }

        function deleteConstraint(idx) {
            $scope.deleteConstraintModalShown = true;
            $scope.constraintToDelete = JSON.parse(JSON.stringify($scope.inputData.cc.constraints[idx]));
            $scope.constraintToDelete.idx = idx;
        }
        function deleteConstraint_submit(data) {
            $scope.inputData.cc.constraints.splice(data.idx, 1);
            $scope.deleteConstraintModalShown = false;
            $scope.constraintToDelete = {};
        }
        function deleteConstraint_close() {
            $scope.deleteConstraintModalShown = false;
            $scope.constraintToDelete = {};
        }

        function addRule() {
            $scope.addRuleModalShown = true;
        }
        function addRule_submit(newRule) {
            let errors = [];
            for (let key in newRule) {
                if (typeof newRule[key] === 'string') {
                    if (newRule[key].lenght < 1) {
                        errors.push(key + ' cannot be blank');
                    } else {

                    }
                } else if (typeof newRule[key] === 'number' && newRule[key] < 1) {
                    errors.push(key + ' cannot be 0');
                }
            }
            if (errors.length > 0) {
                errors.forEach(err => {
                    // alert(err);
                    alertService.createAlert('failure', err, 5000);
                });
            } else {
                $scope.inputData.rf.flexibility.push(JSON.parse(JSON.stringify(newRule)));
                addRule_close();
            }
        }
        function addRule_close() {
            $scope.addRuleModalShown = false;
            $scope.newRule.comparator = "";
            $scope.newRule.percent = 0;
            $scope.newRule.worker = "";
            $scope.newRule.case_type = "";
        }

        function deleteRule(idx) {
            $scope.deleteRuleModalShown = true;
            $scope.ruleToDelete = JSON.parse(JSON.stringify($scope.inputData.rf.flexibility[idx]));
            $scope.ruleToDelete.idx = idx;
        }
        function deleteRule_submit(data) {
            $scope.inputData.rf.flexibility.splice(data.idx, data.idx);
            deleteRule_close();
            // $scope.deleteRuleModalShown = false;
            // $scope.ruleToDelete = {};
        }
        function deleteRule_close() {
            $scope.deleteRuleModalShown = false;
            $scope.ruleToDelete = {};
        }

        //
        // === start validation checks
        function validateData(data) {
            if (data) {
                let conflicts = conflictService.inputs.checkForConflicts(data, $scope.step, $scope.comparators, $scope.flexiblityComparators);
                conflictService.alerts.createConflictAlert(conflicts.conflicts);
                if (conflicts.exist) {
                    return false;
                } else {
                    return true;
                }
            }

            // return false;

        }

        function validateStep(step, dir) {
            if (step === 'FTE') {

            } else if (step === 'AvailableInventoroy') {

            } else if (step === 'CaseConstraints') {

            } else if (step === 'ResourceFlexibility') {

            }
        }

        function validateStep_arrows(step, dir) {
            if (step === 'FTE' && dir === 'prev') {
                return false;
            } else if (step === 'ResourceFlexibility' && dir === 'next') {
                return false;
            } else {
                return true;
            }
        }

        // === end validation checks
        //

        function runnablePlan(step) {
            if (step === 'ResourceFlexibility') {
                return true;
            } else {
                return false;
            }
        }

        function goToPrevStep(step) {
            let newStepIdx = 0;
            $scope.stepsArr.forEach((stp, idx, arr) => {
                if (step === stp) {
                    newStepIdx = idx - 1;
                    messageService.broadcastMessage('changeStep', { step: $scope.stepsArr[newStepIdx] })
                }
            });
        }

        function goToNextStep(step) {
            let newStepIdx = 0;
            $scope.stepsArr.forEach((stp, idx, arr) => {
                if (step === stp) {
                    newStepIdx = idx + 1;
                    messageService.broadcastMessage('changeStep', { step: $scope.stepsArr[newStepIdx] })
                }
            });
        }

        function runPlan(d) {
            // console.log(d);
            var data = JSON.parse(JSON.stringify(d));

            if (data['id']) {
                // --- if the data is not a saved plan (is the default)
                if (data['plan_inputs_id']) {
                    if (JSON.stringify($scope.inputData_rigid) === JSON.stringify(data)) {
                        console.log('exact same plan run before');
                    } else {
                        // if it's not then something changed and it needs to be run

                        delete data.id;
                        delete data.plan_inputs_id;
                        data['created_by'] = 'temp_user';
                        data['title'] = 'temp_title';
                        loaderService.createLoader('Running this previously saved plan again');
                    }
                } else {
                    // --- then checking if the created by is admin and title is default
                    if (data['created_by'] === 'admin' && data['title'] === 'Default Data') {
                        // --- check if the data was changed... if it was remove the ID, change the crerated by and title
                        // if not... it's the default data so just ruun it
                        if (JSON.stringify($scope.inputData_rigid) === JSON.stringify(data)) {
                            loaderService.createLoader('Running the default plan');
                        } else {
                            delete data.id;
                            data['created_by'] = 'temp_user';
                            data['title'] = 'temp_title';
                            loaderService.createLoader('Running your modified plan');
                        }
                        // --- if it's not... idk what is up... 
                    } else {
                        // alert('something went wrong...');
                        alertService.createAlert('failure', 'something went wrong...', 5000);
                        loaderService.removeLoader();
                        return false;
                    }
                }
            } else {
                // theoretically you shouold never get here
                alertService.createAlert('failure', 'something really wrong happend.....', 5000);
                alert('something really wrong happend..... reloading the page.  cool?');
                window.location.reload();
                data['created_by'] = 'temp_user';
                data['title'] = 'temp_title';
            }
            let today = new Date();
            data['created'] = JSON.stringify(today);
            data['modified'] = JSON.stringify(today);

            // ---setting local storage to the run plan so it can be returned to
            localStorage.setItem('_WFOTool_workingPlan', JSON.stringify(data))

            restService.runPlan(data)
                .then(data => {
                    // console.log(data);
                    if (data.statusCode === 200) {
                        // console.log('now send over to the output with the returned data');
                        // console.log(data);
                        $location.path('/output').search(encodeURI(JSON.stringify(data.body)));
                        $scope.$apply();
                        alertService.createAlert('success', 'Your plan was successfully run!', 2500);
                        // localStorage.removeItem('_WFOTool_workingPlan');
                        loaderService.removeLoader();
                    } else if (data.statusCode === 418) {
                        $location.path('/output').search(encodeURI(JSON.stringify(data.body)));
                        $scope.$apply();
                        alertService.createAlert('warning', 'Your plan was run but returned a 418 error with some data showing errors (NaN)!', 10000);
                        // localStorage.removeItem('_WFOTool_workingPlan');
                        loaderService.removeLoader();
                    } else {
                        // --- this is a catch all, there may be more errors codes returned that will work
                        if (data.errorMessage) {
                            alertService.createServerError(data.errorMessage);
                        } else {
                            alertService.createServerError();
                        }
                        loaderService.removeLoader();
                    }
                })
                .catch(err => {
                    loaderService.removeLoader();
                    alertService.createServerError();
                    console.error(err);
                });
        }

        /**
         * get the default plan and set it to the working plan
         * TODO || listeners on change of items to update the working plan
         */
        function getPlans_default() {
            // --- check for a working plan in local storage
            if (localStorage.getItem('_WFOTool_workingPlan')) {
                let d = JSON.parse(localStorage.getItem('_WFOTool_workingPlan'));

                $scope.inputData['fte'] = {};
                $scope.inputData['ai'] = {};

                Object.keys(d.fte).sort().forEach(key => {
                    $scope.inputData.fte[key] = {};
                    Object.keys(d.fte[key]).forEach(key_ => {
                        $scope.inputData.fte[key][key_] = d.fte[key][key_]
                    });
                });
                Object.keys(d.ai).sort().forEach(function (key) {
                    $scope.inputData.ai[key] = {};
                    Object.keys(d.ai[key]).forEach(key_ => {
                        $scope.inputData.ai[key][key_] = d.ai[key][key_];
                    });
                });
                Object.keys(d).sort().forEach(function (key) {
                    if (key !== 'fte' && key !== 'ai') {
                        $scope.inputData[key] = d[key]
                    }
                });

                // setting a "rigid" item to check against when the user wants to run a plan
                $scope.inputData_rigid = JSON.parse(JSON.stringify($scope.inputData));
                // $scope.inputData_rigid = JSON.parse(JSON.stringify(localStorage.getItem('_WFOTool_workingPlan')));
                // $scope.inputData = JSON.parse(localStorage.getItem('_WFOTool_workingPlan'));

                console.log('input data from local storage');
                console.log($scope.inputData);
                $timeout(function () {
                    generateListeners_scroll();
                }, 250);
                loaderService.removeLoader();
                return null;
            }
            // --- if the local storage 
            restService.getDefaultPlan()
                .then(data => {
                    let d = JSON.parse(JSON.stringify(data.body));
                    
                    if (!$scope.inputData.fte && !$scope.inputData.ai) {
                        console.log('DONT DO ANYTHING ');
                    }

                    $scope.inputData['fte'] = {};
                    $scope.inputData['ai'] = {};

                    Object.keys(d.fte).sort().forEach(key => {
                        $scope.inputData.fte[key] = {};
                        Object.keys(d.fte[key]).forEach(key_ => {
                            $scope.inputData.fte[key][key_] = d.fte[key][key_]
                        });
                    });
                    Object.keys(d.ai).sort().forEach(function (key) {
                        $scope.inputData.ai[key] = {};
                        Object.keys(d.ai[key]).forEach(key_ => {
                            $scope.inputData.ai[key][key_] = d.ai[key][key_];
                        });
                    });
                    Object.keys(d).sort().forEach(function (key) {
                        if (key !== 'fte' && key !== 'ai') {
                            $scope.inputData[key] = d[key]
                        }
                    });

                    $scope.inputData_rigid = JSON.parse(JSON.stringify($scope.inputData));
                    // $scope.inputData = data.body;
                    $scope.$apply();
                    $timeout(function () {
                        generateListeners_scroll();
                    }, 250);
                    // console.log('saved data loaded for default');
                    localStorage.setItem('_WFOTool_workingPlan', JSON.stringify(data.body))
                    loaderService.removeLoader();
                    return null;
                })
                .catch(err => {
                    loaderService.removeLoader();
                    alertService.createServerError();

                    console.error(err);
                    return null;
                });
        }

        /**
         * get the saved plans from the database
         * 
         */
        function getPlans_savedPlans() {
            restService.getSavedPlans()
                .then(data => {
                    let saved_array = data.body.Items;

                    saved_array.forEach((plan, idx, arr) => {
                        $scope.savedPlans[idx] = {};
                        $scope.savedPlans[idx]['fte'] = {};
                        $scope.savedPlans[idx]['ai'] = {};

                        Object.keys(plan.fte).sort().forEach(key => {
                            $scope.savedPlans[idx].fte[key] = {};
                            Object.keys(plan.fte[key]).forEach(key_ => {
                                $scope.savedPlans[idx].fte[key][key_] = plan.fte[key][key_]
                            });
                        });
                        Object.keys(plan.ai).sort().forEach(function (key) {
                            $scope.savedPlans[idx].ai[key] = {};
                            Object.keys(plan.ai[key]).forEach(key_ => {
                                $scope.savedPlans[idx].ai[key][key_] = plan.ai[key][key_];
                            });
                        });
                        Object.keys(plan).sort().forEach(function (key) {
                            if (key !== 'fte' && key !== 'ai') {
                                $scope.savedPlans[idx][key] = plan[key]
                            }
                        });
                    });
                    // $scope.savedPlans = data.body.Items;
                    $scope.$apply();
                    restService.getDefaultPlan()
                        .then(d_ => {
                            let d = JSON.parse(JSON.stringify(d_.body));
                            let _d = {};

                            _d['fte'] = {};
                            _d['ai'] = {};

                            Object.keys(d.fte).sort().forEach(key => {
                                _d.fte[key] = {};
                                Object.keys(d.fte[key]).forEach(key_ => {
                                    _d.fte[key][key_] = d.fte[key][key_]
                                });
                            });
                            Object.keys(d.ai).sort().forEach(function (key) {
                                _d.ai[key] = {};
                                Object.keys(d.ai[key]).forEach(key_ => {
                                    _d.ai[key][key_] = d.ai[key][key_];
                                });
                            });
                            Object.keys(d).sort().forEach(function (key) {
                                if (key !== 'fte' && key !== 'ai') {
                                    _d[key] = d[key]
                                }
                            });
                            $scope.savedPlans.push(d);
                            console.log($scope.savedPlans);
                        })
                        .catch(err => {
                            loaderService.removeLoader();
                            alertService.createServerError();

                            console.error(err);
                            return null;
                        })
                })
                .catch(err => {
                    loaderService.removeLoader();
                    alertService.createServerError();

                    console.error(err);
                })
        }

        /**
         * update the working plan in local storage
         */
        function updateWorkingPlanSave(data) {
            localStorage.setItem('_WFOTool_workingPlan', JSON.stringify(data))
        }

        /**
         * generating the listeners foro the horizontal scroll
         */
        function generateListeners_scroll() {
            if (document.getElementById('workers')) {
                document.getElementById('workers').addEventListener('scroll', function (e) {
                    document.getElementById('costs').scrollLeft = e.target.scrollLeft;
                });
            }
            if (document.getElementById('costs')) {
                document.getElementById('costs').addEventListener('scroll', function (e) {
                    document.getElementById('workers').scrollLeft = e.target.scrollLeft;
                });
            }
        }

        /**
         * generic listeners
         */
        function generateListeners() {
            // route change listener
            $scope.$on('$routeChangeSuccess', ($event, next, current) => {
                if (next.params.step) {
                    $scope.step = next.params.step;
                } else {
                    $scope.step = '';
                }
            });

            $scope.$on('changeStep', ($event, data) => {
                $scope.step = data.step;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });

            window.addEventListener('resize', (e) => {
                // console.log(e);
                workersScroll_checkOverflow();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            })
        }

        function checkForStep() {
            if (!$location.$$search.step) {
                $location.path('input');
                setTimeout(() => {
                    messageService.broadcastMessage('changeStep', { step: 'FTE' });
                }, 500)
            }
        }

        /**
         * init
         */
        function init() {
            console.log('planInputs module');
            checkForStep();

            loaderService.createLoader('loading the default plan. . .');

            generateListeners();
            // getPlans_default('data/defaultInputs.json');
            getPlans_default();
            getPlans_savedPlans('data/fakeSavedPlans.json');



        }

        init();

    });