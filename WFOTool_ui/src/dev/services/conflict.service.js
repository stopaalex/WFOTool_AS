var conflictService = angular.module('conflictService', [])
    .service('conflictService', function ($rootScope) {

        var conflictService = this;

        conflictService.inputs = {
            checkForConflicts: (data, step, cccomparators, rfcomparators) => {
                let return_object = {
                    conflicts: [],
                    exist: false
                }
                // --- checking the case constraints

                let conflictObject = JSON.parse(JSON.stringify(data));

                for (let key in conflictObject) {
                    // string
                    if (typeof conflictObject[key] === 'string') {
                        conflictObject[key] = '';
                    } else {
                        for (let key_ in conflictObject[key]) {
                            if (conflictObject[key][key_].length) {
                                // list
                                conflictObject[key][key_].forEach((o, i, a) => {
                                    for (let k in o) {
                                        o[k] = '';
                                    }
                                });
                            } else {
                                // object
                                for (let key__ in conflictObject[key][key_]) {
                                    conflictObject[key][key_][key__] = ''
                                }
                            }
                        }
                    }
                }

                // --- CASE CONSTRAINTS
                // --- check the case constraints foro conflicts
                data.cc.constraints.forEach((cont, idx, arr) => {
                    // --- create the equation for checking against the available inventory
                    let equation = data.ai[cont.case_type].cases + cccomparators[cont.comparator] + cont.volume
                    
                    // --- conflict found between this case and the worker/case type
                    //
                    if (!eval(equation)) {
                        return_object.conflicts.push({
                            step: 'Case Constraints',
                            id: idx,
                            conflictString: 'A conflict exists with ' + data.ai[cont.case_type].title + ' and item ' + (idx + 1),
                            case: data.ai[cont.case_type].title
                        });
                    }

                    // --- check the other cases for conflicts between constraints
                    // 
                    arr.forEach((cont_, idx_, arr_) => {
                        if (idx !== idx_) {
                            if (cont.case_type === cont_.case_type) {
                                if (cccomparators[cont.comparator] === '>') {
                                    if (cccomparators[cont_.comparator] === "=" || cccomparators[cont_.comparator] === "<=" || cccomparators[cont_.comparator] === "<") {
                                        if (cont.volume >= cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                    // at least
                                } else if (cccomparators[cont.comparator] === '>=') {
                                    if (cccomparators[cont_.comparator] === "<" || cccomparators[cont_.comparator] === "<=" || cccomparators[cont_.comparator] === '=') {
                                        if (cont.volume !== cont_.volume && cont.volume > cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                    // equal
                                } else if (cccomparators[cont.comparator] === '=') {
                                    // TODO - figure this one out
                                    if (cccomparators[cont_.comparator] === '=') {
                                        if (cont.volume !== cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (cccomparators[cont_.comparator] === '>') {
                                        if (cont.volume < cont_.volume || cont.volume === cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (cccomparators[cont_.comparator] === '>=') {
                                        if (cont.volume < cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (cccomparators[cont_.comparator] === '<') {
                                        if (cont.volume > cont_.volume || cont.volume === cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (cccomparators[cont_.comparator] === '<') {
                                        if (cont.volume > cont_.volume || cont.volume === cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (cccomparators[cont_.comparator === '<=']) {
                                        if (cont.volume > cont_.volume) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                    // no more than
                                } else if (cccomparators[cont.comparator] === '<=') {
                                    if (cccomparators[cont_.comparator] === ">" || cccomparators[cont_.comparator] === ">=" || cccomparators[cont_.comparator] === '=') {
                                        if (cont.volume !== cont_.volume && cont.volume < cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    }

                                    // less than
                                } else if (cccomparators[cont.comparator] === '<') {
                                    if (cccomparators[cont_.comparator] === ">" || cccomparators[cont_.comparator] === ">=" || cccomparators[cont_.comparator] === '=') {
                                        if (cont.volume < cont_.volume) {
                                            return_object = this.inputs.createCCConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                }
                            }
                        }
                    });
                });

                // --- RESOURCE FLEXIBILITY
                // --- check the resource flexibility foro conflicts
                data.rf.flexibility.forEach((flex, idx, arr) => {
                    // --- firist check if there are conflicts between the flexiblity and the workers
                    // create the total worker hours
                    let totalWorkerHours   = (data.fte[flex.worker].fte * 2000) * (flex.percent / 100);
                    // create the available hours to for the worker to work
                    let availableCaseHours = data.ai[flex.case_type].cases * data.ai[flex.case_type].hours;
                    let comparator         = flex.comparator.toLowerCase() === 'exactly' ? '===' : rfcomparators[flex.comparator];
                    let equation           = availableCaseHours + comparator + totalWorkerHours;


                    // --- conflict found between this case and the worker/case type
                    //
                    if (!eval(equation)) {
                        return_object.conflicts.push({
                            step: 'Resource Flexibility',
                            id: idx,
                            conflictString: 'A conflict exists with ' + data.fte[flex.worker].title + ' and item ' + (idx + 1),
                            worker: data.fte[flex.worker].title
                        });
                    }

                    // --- check for conflicts between flexiblities
                    //
                    arr.forEach((flex_, idx_, arr_) => {
                        if (idx !== idx_) {
                            if (flex.worker === flex_.worker && flex.case_type === flex_.case_type) {
                                // this is the only place an error could occur
                                // more than
                                if (rfcomparators[flex.comparator] === '>') {
                                    if (rfcomparators[flex_.comparator] === "=" || rfcomparators[flex_.comparator] === "<=" || rfcomparators[flex_.comparator] === "<") {
                                        if (flex.percent >= flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                    // at least
                                } else if (rfcomparators[flex.comparator] === '>=') {
                                    if (rfcomparators[flex_.comparator] === "<" || rfcomparators[flex_.comparator] === "<=" || rfcomparators[flex_.comparator] === '=') {
                                        if (flex.percent !== flex_.percent && flex.percent > flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                    // equal
                                } else if (rfcomparators[flex.comparator] === '=') {
                                    // TODO - figure this one out
                                    if (rfcomparators[flex_.comparator] === '=') {
                                        if (flex.percent !== flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (rfcomparators[flex_.comparator] === '>') {
                                        if (flex.percent < flex_.percent || flex.percent === flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (rfcomparators[flex_.comparator] === '>=') {
                                        if (flex.percent < flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (rfcomparators[flex_.comparator] === '<') {
                                        if (flex.percent > flex_.percent || flex.percent === flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (rfcomparators[flex_.comparator] === '<') {
                                        if (flex.percent > flex_.percent || flex.percent === flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    } else if (rfcomparators[flex_.comparator === '<=']) {
                                        if (flex.percent > flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                    // no more than
                                } else if (rfcomparators[flex.comparator] === '<=') {
                                    if (rfcomparators[flex_.comparator] === ">" || rfcomparators[flex_.comparator] === ">=" || rfcomparators[flex_.comparator] === '=') {
                                        if (flex.percent !== flex_.percent && flex.percent < flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    }

                                    // less than
                                } else if (rfcomparators[flex.comparator] === '<') {
                                    if (rfcomparators[flex_.comparator] === ">" || rfcomparators[flex_.comparator] === ">=" || rfcomparators[flex_.comparator] === '=') {
                                        if (flex.percent < flex_.percent) {
                                            return_object = this.inputs.createRFConflictObject(return_object, idx, idx_);
                                        }
                                    }
                                }
                            }
                        }
                    });
                });

                // --- check if the length of the conflicts is greater than 0
                // --- if so, then sort them
                //
                if (return_object.conflicts.length > 0) {
                    return_object.conflicts.sort((a, b) => {
                        if (a.conflictString > b.conflitString) { return 1 }
                        else if (a.conflictString < b.conflictString) { return -1 }
                        else { return 0 }
                    });
                    return_object.exist = true;
                }

                return return_object;

            },
            createRFConflictObject: (obj, i, i_) => {
                obj.conflicts.push({
                    step: 'Resource Flexibility',
                    id: i,
                    id_: i_,
                    conflictString: 'A conflict exists between rows ' + (i + 1) + ' and ' + (i_ + 1)
                });
                return obj;
            },
            createCCConflictObject: (obj, i, i_) => {
                obj.conflicts.push({
                    step: 'Case Constraints',
                    id: i,
                    id_: i_,
                    conflictString: 'A conflict exists between rows ' + (i + 1) + ' and ' + (i_ + 1)
                });
                return obj;
            }
        };
        conflictService.alerts = {
            createConflictAlert: conflictArr => {
                let conflictEle = document.getElementById('conflictAlerts');
                let html        = '';
                let htmlclick   = ''

                conflictArr.forEach(a => {
                    // console.log(a);
                    if (!a.worker && !a.case) {
                        htmlclick = '\
                        if (window.location.href.indexOf(\'' + a.step.replace(/ /g, '') + '\') !== -1) {\
                            document.getElementById(\'' + a.id + '\').classList.add(\'highlight\');\
                            document.getElementById(\'' + a.id_ + '\').classList.add(\'highlight\');\
                        }'
                    } else {
                        if (a.worker) {
                            htmlclick = '\
                            if (window.location.href.indexOf(\'' + a.step.replace(/ /g, '') + '\') !== -1) {\
                                document.getElementById(\'' + a.id + '\').classList.add(\'highlight\');\
                            } else if (window.location.href.indexOf(\'FTE\') !== -1) {\
                                document.getElementsByClassName(\'' + a.worker.replace('Worker', '') + '\')[0].classList.add(\'highlight\');\
                                document.getElementsByClassName(\'' + a.worker.replace('Worker', '') + '\')[1].classList.add(\'highlight\');\
                            }'
                        } else if (a.case) {
                            htmlclick = '\
                            if (window.location.href.indexOf(\'' + a.step.replace(/ /g, '') + '\') !== -1) {\
                                document.getElementById(\'' + a.id + '\').classList.add(\'highlight\');\
                            } else if (window.location.href.indexOf(\'AvailableInventory\') !== -1) {\
                                document.getElementsByClassName(\'' + a.case.replace('Case Type', '') + '\')[0].classList.add(\'highlight\');\
                                document.getElementsByClassName(\'' + a.case.replace('Case Type', '') + '\')[1].classList.add(\'highlight\');\
                            }'
                        }
                    }

                    html += '<div class="conflict" onclick="' + htmlclick + '">\
                                ' + a.conflictString + ' in ' + a.step + '\
                            </div>'
                });
                conflictEle.innerHTML = '';
                conflictEle.innerHTML = html;
                this.alerts.checkForConflictHighlights();
            },
            checkForConflictHighlights: () => {
                setInterval(() => {
                    let highlightedEles = document.querySelectorAll('.highlight');
                    if (highlightedEles.length > 0) {
                        for (let i=0;i<highlightedEles.length;i++) {
                            this.alerts.clearHighlight(highlightedEles[i]);
                        }
                    }
                }, 500);
            },
            clearHighlight: (ele) => {
                setTimeout(() => {
                    ele.classList.remove('highlight');
                }, 5000);
            }
        }

    });


    // if (window.location.href.indexOf('ResourceFlexiblity') !== -1) {if (document.getElementById('0').classList.contains('highlight')) {document.getElementById('0').classList.remove('highlight');                                            } else {                                                document.getElementById('0').classList.add('highlight');                                            }                                            if (document.getElementById('2').classList.contains('highlight')) {                                                document.getElementById('2').classList.remove('highlight');                                            } else {                                                document.getElementById('2').classList.add('highlight');}} else if (window.location.href.indexOf('FTE') !== -1) {console.log('asdfasdf')} else {console.log('naw dawg')}