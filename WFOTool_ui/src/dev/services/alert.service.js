var alertService = angular.module('alertService', [])
    .service('alertService', function ($rootScope) {

        var alertService = this;

        /**
         * 
         * @param {string} type success, warning, or failure
         * @param {strring} msg the string foro teh alert
         * @param {number} timer the length the alert stays up
         */
        alertService.createAlert = function (type, msg, timer) {
            //
            // --- TYPES OF ALERTS
            let typesofalerts = [
                'success',
                'warning',
                'failure'
            ]

            let alertContainer = document.getElementById('__alert');
            let randID         = Math.floor((Math.random() * 10000) + 1);
            let closeAlert     = '<button class="alert-close" onclick="document.getElementById(\'' + randID + '\').parentNode.removeChild(document.getElementById(\'' + randID + '\'))"><i class="fa fa-times"></i></button>'

            let newAlertHTML = '\
            <div id="' + randID + '" class="alert ' + type + '">\
                <div class="msg">' + msg + '</div>\
                <div class="close">' + closeAlert + '</div>\
            </div>\
            ';

            alertContainer.innerHTML += newAlertHTML;

            setTimeout(() => {
                alertService.fadeoutAlert(randID);
                setTimeout(() => {
                    alertService.deleteAlert(randID);
                }, 250);
            }, timer);
        }

        alertService.createServerError = function (msg) {
            let alertContainer = document.getElementById('__alert');

            let randID = Math.floor((Math.random() * 10000) + 1);
            let timer = 100000000;

            let closeAlert = '<button class="alert-close" onclick="document.getElementById(\'' + randID + '\').parentNode.removeChild(document.getElementById(\'' + randID + '\'))"><i class="fa fa-times"></i></button>'
            let newAlertHTML = '';

            if (msg) {
                newAlertHTML = '\
                <div id="' + randID + '" class="alert ' + 'failure' + '">\
                    <div class="msg">' + 'ERROR: A server error has occured' + '</div>\
                    <div class="msg">' + msg + '</div>\
                    <div class="close">' + closeAlert + '</div>\
                </div>\
                ';
            } else {
                newAlertHTML = '\
                <div id="' + randID + '" class="alert ' + 'failure' + '">\
                    <div class="msg">' + 'ERROR: An unknown server error has occured' + '</div>\
                    <div class="msg">' + '-' + '</div>\
                    <div class="msg">' + 'Please refresh your browser' + '</div>\
                    <div class="close">' + closeAlert + '</div>\
                </div>\
                ';
            }

            alertContainer.innerHTML += newAlertHTML;

            setTimeout(() => {
                alertService.fadeoutAlert(randID);
                setTimeout(() => {
                    alertService.deleteAlert(randID);
                }, 250);
            }, timer)
        }

        alertService.fadeoutAlert = function (id) {
            if (document.getElementById(id)) {
                let alert = document.getElementById(id);
                alert.classList.add('fade-out');
            }
        }

        alertService.deleteAlert = function (id) {
            if (document.getElementById(id)) {
                document.getElementById(id).parentNode.removeChild(document.getElementById(id));
            }
        }

    });