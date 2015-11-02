'use strict';

angular.module('wcagReporter')
.factory('importV2', function (evalContextV1, evalContextV2) {

    function isV1(data) {
        var dataContext  = data['@context'];
        var contextProps = Object.keys(evalContextV1);
        // Skip if the context isn't there
        if (typeof dataContext !== 'object') {
            return false;
        }

        // Dirty check if they have the same keys
        if (contextProps.sort().join(',') !== Object.keys(dataContext).sort().join(',')) {
            return false;
        }

        return contextProps.reduce(function (result, prop) {
            if (!result) { // false is false
                return result;

            // Context prop doesn't exist
            } else if (typeof dataContext[prop] === 'undefined') {
                return false;

            // Context prop is different value
            } else if (typeof dataContext[prop] === 'string' &&
                dataContext[prop] !== evalContextV1[prop]) {
                return false;

            // Context prop is an object, compare it's content
            } else if (typeof dataContext[prop] === 'object') {
                return Object.keys(evalContextV1[prop])
                .reduce(function (result, subProp) {
                    if (!result) {
                        return result;

                    } else if (typeof dataContext[prop][subProp] === 'undefined') {
                        return false;

                    } else if (typeof dataContext[prop][subProp] === 'string' &&
                        dataContext[prop][subProp] !== evalContextV1[prop][subProp]) {
                        return false;
                    } else {
                        return true;
                    }
                }, true);

            } else {
                return true;
            }
        }, true);
    }

    function convertToV2(data) {
        data.auditResult.forEach(function (result) {
            result.type = result.type.replace('earl:assertion', 'earl:Assertion');
        });

        function fixPage(page) {
            page.type  = page.type.replace('webpage', 'Webpage');
            page.title = page.handle;
            delete page.handle;
        }

        if (!angular.isArray(data.structuredSample.webpage)) {
            data.structuredSample.webpage = [data.structuredSample.webpage];
        }
        data.structuredSample.webpage.forEach(fixPage);

        if (!angular.isArray(data.randomSample.webpage)) {
            data.randomSample.webpage = [data.randomSample.webpage];
        }
        data.randomSample.webpage.forEach(fixPage);

        data['@context'] = evalContextV2;

        return data;
    }

    function convertor (data) {
        if (isV1(data)) {
            data = convertToV2(data);
        }
        return data;
    }

    convertor.isV1 = isV1;
    convertor.convertToV2 = convertToV2;

    return convertor;

});