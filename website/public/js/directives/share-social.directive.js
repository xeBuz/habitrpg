/**
 * Created by Sabe on 6/26/2015.
 */
'use strict';

angular
  .module('habitrpg')
  .directive('shareSocial', shareSocial);

shareSocial.$inject = [
  '$timeout'
];

function shareSocial($timeout) {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    template: '<div ng-transclude></div>',
    link: function($scope, element, attrs) {
      $timeout(function () {
        addthis.init();
        addthis.toolbox($(element).get(), {}, {
          url: attrs.url,
          title : attrs.title,
          description : attrs.description
        });
      });
    }
}}
