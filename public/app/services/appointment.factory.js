'use strict';

angular.module('appointmentResource', [])
    .factory('appointmentResource', function($resource) {
        return $resource('/api/appointments/:initDate/:endDate', {}, {    	
            query: {
                method: "GET",
                params: {},
                isArray: true,
                cache: true
            },
            /*get: {
                method: "GET",
                params: {id: "@id"},
                isArray: false,
                cache: false
                // transformResponse,
                // interceptor
            },*/
            update: { 
                method:'PUT'
            },
            getCalendar: {
                method: "GET",
                params: {initDate: "@initDate", endDate: "@endDate"},
                isArray: false
            }
        })
    });