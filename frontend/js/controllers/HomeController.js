(function() {
    'use strict';

    angular.module('chirp')
        .controller('HomeCtrl', ['$scope','$log','$http','$location','$routeParams','AuthService', 'DataService',
            function ($scope, $log, $http, $location,$routeParams,AuthService, DataService)
            {
                $scope.credentials = {
                    username: '',
                    password: ''
                };

                $scope.login = function (credentials) {
                    AuthService.
                        login(credentials,
                        function (data) {
                            $rootScope.connectedUser = data;
                            $location.path('/home/' + credentials.username);
                            $location.replace();
                        },
                        function () {
                            alert('The credentials are wrong!');
                        });
                };

                DataService.getHomePostList($routeParams.username,
                    function (data) {
                        $scope.posts = data;
                    },
                    function () {
                        alert('Error on retrieving chirps data.');
                    });
            }
        ]);

})();
