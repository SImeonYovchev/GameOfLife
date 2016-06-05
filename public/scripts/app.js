'use strict';

angular.module('gameOfLife', ['ngRoute', 'ngDialog'])
    .config(function($routeProvider){
        $routeProvider
        .when('/', {
            templateUrl: 'views/app.html',
            controller: 'AppController'
        });
    });

