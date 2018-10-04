var mainApp = angular.module("mainApp", ['ngRoute','angular-md5',"mymodule"]);
mainApp.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'partials/home.html',
			controller: 'Login'
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'Register'
        })
		.when('/userpage', {
            templateUrl: 'partials/userpage.html',
            controller: 'Userpage'
        })
		.when('/userdetailspage', {
            templateUrl: 'partials/userdetailspage.html',
            controller: 'Userpage'
        })
		.when('/advertisement',{
            templateUrl: 'partials/advertisement.html',
            controller: 'Userpage'
        })
		.when('/myads',{
            templateUrl: 'partials/myadvertisement.html',
            controller: 'Userpage'
        })
        .otherwise({
            redirectTo: '/home'
        });
});