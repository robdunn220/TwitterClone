var app = angular.module('Twitter', ['ui.router']);

app.factory("TwitterApi", function factoryFunction($http) {
  var service = {};

  service.getProfile = function(userID) {
    return $http ({
      url: '/profile/' + userID
    });
  };

  service.getUserInfo = function(userID) {
    return $http ({
      url: '/user_info/' + userID
    });
  };

  service.getUserLogin = function(userId, password) {
    return $http ({
      url: '/userLogin/' + userId + '/' + password
    });
  };

  service.userSignup = function(userId, password, website, avatar_url){
    return $http({
      url: '/signup',
      method: 'POST',
      data: {
        _id : userId,
        password: password,
        website: website,
        avatar_url: avatar_url
      }
    });
  };


  return service;
});

app.controller('HomeController', function($scope, $stateParams, TwitterApi) {
  TwitterApi.getUserInfo($stateParams.userID).success(function(result) {
    $scope.tweets = result;
    console.log($scope.tweets);
  })
  .error(function(err) {
    console.log('Error: ', err.message);
  });
});



app.controller('ProfileController', function($scope, $stateParams, TwitterApi) {
  console.log($stateParams.userID);
  TwitterApi.getProfile($stateParams.userID).success(function(result) {
    $scope.tweets = result;
    console.log($scope.tweets);
  })
  .error(function(err) {
    console.log('Error: ', err);
  });
});

app.controller('LoginController', function($scope, $stateParams, $state, TwitterApi) {
  $scope.userLogin = function(userId, password){

    TwitterApi.getUserLogin(userId, password).success(function(result) {
      if (result !== null) {
        if (result === 'nope'){
          console.log('Nope');
        }
        else {
          $state.go('profile', {userID: userId});
        }
      }

      else {
        $state.go('signup');
      }
    });
  };
});

app.controller('SignupController', function($scope, $stateParams, $state, TwitterApi) {
  $scope.userSignup = function(userId, website, avatar_url) {
    // var userData ={
    //   _id : userId,
    //   website: website,
    //   avatar_url: avatar_url
    // };
    TwitterApi.userSignup(userId, website, avatar_url).success(function(result) {
      console.log(result);
    });
  };

});


app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state({
      name: 'profile',
      url: '/profileInfo/{userID}',
      templateUrl: 'profile.html',
      controller: 'ProfileController'
    })
    .state({
      name: 'login',
      url: '/login',
      templateUrl: 'login.html',
      controller: 'LoginController'
    })
    .state({
      name: 'signup',
      url: '/signup',
      templateUrl: 'signup.html',
      controller: 'SignupController'
    })
    .state({
      name: 'home',
      url: '/home/{userID}',
      templateUrl: 'home.html',
      controller: 'HomeController'
    });
});
