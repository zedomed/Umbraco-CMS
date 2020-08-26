/**
 * @ngdoc filter
 * @name umbraco.filters.filter:umbCmsRemoveHtml
 * @namespace umbCmsRemoveHtml
 *
 * param {string} String to manipulate
 *
 * @description
 * Remove HTML Tags from given string.
 */
angular.module("umbraco.filters").filter('umbCmsRemoveHtml',
    function () {
        return function (text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    }
);
