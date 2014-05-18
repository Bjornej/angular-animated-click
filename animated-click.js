angular.module("ng").directive("ngSingleClick", ["$parse", function ($parse) {
    "use strict";

    var startSpinner = function (element) {
        var height = element.offsetHeight,
                     spinnerColor;

        angular.element(element).addClass("animated-button");

        if (height === 0) {
            // We may have an element that is not visible so
            // we attempt to get the height in a different way
            height = parseFloat(window.getComputedStyle(element).height);
        }

        // If the button is tall we can afford some padding
        if (height > 32) {
            height *= 0.8;
        }

        if (!element.querySelector('.animated-label')) {
            element.innerHTML = '<span class="animated-label">' + element.innerHTML + '</span>';
        }

        // The spinner component
        var spinner;

        // Wrapper element for the spinner
        var spinnerWrapper = document.createElement('span');
        spinnerWrapper.className = 'animated-spinner';
        element.appendChild(spinnerWrapper);


        element.setAttribute('disabled', '');
        element.setAttribute('data-loading', '');
        var lines = 12,
            radius = height * 0.2,
            length = radius * 0.6,
            width = radius < 7 ? 2 : 3;


        spinner = new Spinner({
            color: '#fff',
            lines: lines,
            radius: radius,
            length: length,
            width: width,
            zIndex: 'auto',
            top: 'auto',
            left: 'auto',
            className: ''
        });

        spinner.spin(element.querySelector('.animated-spinner'));

    };

    var stopSpinner = function (element) {
        element.removeAttribute('disabled');
        element.removeAttribute('data-loading');
        angular.element(element).removeClass("animated-button");
        angular.element(element.querySelector('.animated-spinner')).remove();
    };

    return {
        restrict: "A",
        controller: ['$scope', function ($scope) {
            // indicates if function invoked by the click is currently running
            this.running = false;
        }],
        compile: function ($element, attr) {
            var fn = $parse(attr.ngSingleClick);
            return function (scope, element, attr, controller) {

                element.on("click", function (event) {

                    // if function is currently running don't execute it again
                    if (!controller.running) {
                        scope.$apply(function () {

                            // if invoked function returns a promise wait for it's completion
                            var result = fn(scope, { $event: event });
                            if (result.finally !== undefined) {
                                startSpinner(element[0]);
                                controller.running = true;
                                result.finally(function () {
                                    controller.running = false;
                                    stopSpinner(element[0]);
                                });
                            }
                        });
                    }
                });
            };
        }
    };
}]);
