angular.module('registrationApp', ['ngAnimate', 'ui.router', 'ngCookies', 'ngStorage', 'credit-cards'])

.config(function ($stateProvider, $urlRouterProvider) {
    
    $stateProvider
    
        .state('form', {
            url: '/form',
            abstract: true,
            templateUrl: 'form.html',
            controller: 'formController'
        })
        
        .state('form.profile', {
            url: '/profile',
            templateUrl: 'form-profile.html',
            controller: 'formProfileCtrl'
        })
        
        .state('form.car', {
            url: '/car',
            templateUrl: 'form-car.html',
            controller: 'formCarCtrl'
        })
        
        .state('form.payment', {
            url: '/payment',
            templateUrl: 'form-payment.html'
        })
    
        .state('success', {
            url: '/success',
            templateUrl: 'success.html'
        })
    
        .state('storage', {
            url: '/storage',
            templateUrl: 'storage.html',
            controller: 'storageCtrl'
        });
       
    $urlRouterProvider.otherwise('/form/profile');
})

.controller('formController', function($scope, $rootScope, $state, $cookies, $window, $localStorage) {
    $scope.registrationData = $cookies.getObject('regData') || {};
    $scope.currentState = $state.current.name;
    $localStorage = $localStorage.$default({
        things: []
    });
    
    var storeAppState = function() {
        if($state.is('success')) {
            $cookies.remove('regData');
            $scope.registrationData = {};
        }
        else {
            $cookies.putObject('regData', $scope.registrationData);
        }
    };
    
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $scope.currentState = toState.name;
        storeAppState();
    });
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
        if(toState.name === 'form.car' && $scope.profileInvalid) {
            event.preventDefault();
        }
        if(toState.name === 'form.payment' && ($scope.profileInvalid || $scope.carInvalid)) {
            event.preventDefault();
        }
    });
                   
    $window.onbeforeunload = function() {
        storeAppState();
    };
    
    $scope.$on('$destroy', function(e){
        $window.onbeforeunload = undefined;
    });
    
    $scope.goToState = function(state) {
        if (state === 'profile'){
            $state.go('form.profile');
        }
        else if(state === 'car' && !$scope.profileInvalid) {
            $state.go('form.car');
        }
        else if(state === 'payment' && !$scope.carInvalid) {
            $state.go('form.payment');
        }
    };
    
    $scope.$on('profileInvalid', function(event, profileInvalid) {
        $scope.profileInvalid = profileInvalid;
    });
    
    $scope.$on('carInvalid', function(event, carInvalid) {
        $scope.carInvalid = carInvalid;
    });
    
    /* Checking if the first form is populated */
    if($scope.registrationData.firstName && 
       $scope.registrationData.lastName  &&
       $scope.registrationData.email) {
        /* Checking if the second form is populated */
        if($scope.registrationData.carMake &&
           $scope.registrationData.carModel) {
            $state.go('form.payment');
        }
        else {
            $state.go('form.car');
        }
    };
    
    $scope.saveData = function (data) {
        $localStorage.things.push(data);
    }
    
})

.controller('formProfileCtrl', function($scope) {
    $scope.setForm = function(form) {
        $scope.form = form;
    }
    $scope.$watch('form.$invalid', function (newVal) {
        $scope.$emit('profileInvalid', newVal);
    });
})

.controller('formCarCtrl', function($scope) {
    $scope.setForm = function(form) {
        $scope.form = form;
    }
    $scope.$watch('form.$invalid', function (newVal) {
        $scope.$emit('carInvalid', newVal);
    });
    $scope.$watch('carMake', function (newVal) {
        if(newVal) {
            $scope.registrationData.carMake = newVal.name;
            $scope.registrationData.carModel = null;
        }
    });
    $scope.$watch('carModel', function (newVal) {
        if(newVal) {
            $scope.registrationData.carModel = newVal.name;
        }
    });
    
    $scope.cars = [
        {
            "name": "Honda",
            "models": [
                {
                "name": "Accord"
                },
                {
                "name": "Civic"
                },
                {
                "name": "HRV"
                }
            ]
        },
        {
            "name": "Toyota",
            "models": [
                {
                "name": "Camry"
                },
                {
                "name": "Avensis"
                },
                {
                "name": "RAV4"
                }
            ]
        },
        {
            "name": "Volkswagen",
            "models": [
                {
                "name": "Golf"
                },
                {
                "name": "Passat"
                },
                {
                "name": "Touareg"
                }
            ]
        }
    ];
    
    $scope.carMake = _.find($scope.cars, {'name' : $scope.registrationData.carMake});
    if($scope.carMake) {
        $scope.carModel = _.find($scope.carMake.models, {'name' : $scope.registrationData.carModel});
    }
})

.controller('storageCtrl', function($scope, $localStorage) {
    $scope.things = $localStorage.things
})

.run(function($rootScope){
     $rootScope.$on("$stateNotFound", function (event, unfoundState, fromState, fromParams) { 
         if (unfoundState.to == '-') { 
             event.preventDefault(); 
             return; 
         }
     });
});
