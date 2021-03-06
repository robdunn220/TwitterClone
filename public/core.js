var app = angular.module('Twitter', ['ui.router', 'ngCookies']);

app.factory("TwitterApi", function factoryFunction($http, $rootScope, $cookies, $state) {
  var service = {};

  if ($cookies.get('token')) {
    $rootScope.loginState = true;
  }

  else if (!$cookies.get('token')) {
    $rootScope.loginState = false;
  }

  $rootScope.logout = function() {
    console.log('Logout');
    $cookies.remove('token');
    $cookies.remove('userId');
    $rootScope.loginState = false;
    $state.go('home', {}, { reload: true });
  };

  service.getProfile = function(userID) {
    return $http ({
      url: '/profile/' + userID
    });
  };

  service.getWorldTimeline = function() {
    return $http ({
      url: '/world/timeline'
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

  service.createTweet = function(userID, text) {
    return $http({
      url: '/tweet/' + userID + '/' + text,
      method: 'POST'
    });
  };

  service.follow = function(followID, userID) {
    return $http({
      url: '/follow',
      method: 'POST',
      data: {
        follower: userID,
        following: followID
      }
    });
  };

  return service;
});

app.controller('HomeController', function($scope, $cookies, $state, $rootScope, TwitterApi) {
  if ($rootScope.loginState === true) {
    $scope.userId = $cookies.get('userId');
    TwitterApi.getUserInfo($scope.userId).success(function(result) {
      $scope.tweets = result;
    })
    .error(function(err) {
      console.log('Error: ', err.message);
    });

    $scope.tweet = function(text) {
      TwitterApi.createTweet($scope.userId, text).success(function(res) {
        console.log('Tweeted successfully');
      });
      $state.go('home', {}, { reload: true });
    };
  }

  else if ($rootScope.loginState === false){
    TwitterApi.getWorldTimeline().success(function(result) {
      $scope.tweets = result;
      console.log($scope.tweets);
    });
  }

});

app.controller('ProfileController', function($scope, $stateParams, $state, $cookies, TwitterApi) {
  console.log($stateParams.userID);
  TwitterApi.getProfile($stateParams.userID).success(function(result) {
    $scope.tweets = result;
    console.log($scope.tweets);
  })
  .error(function(err) {
    console.log('Error: ', err);
  });

  $scope.followUser = function(followID) {
    TwitterApi.follow(followID, $cookies.get('userId')).success(function(result) {
      console.log(result);
    });
    $state.go('profile', {userID: $stateParams.userID}, {reload: true});
  };
});

app.controller('LoginController', function($scope, $stateParams, $state, $cookies, TwitterApi, $rootScope) {
  $scope.userLogin = function(userId, password){

    TwitterApi.getUserLogin(userId, password).success(function(result) {
      if (result !== null) {
        if (result === 'nope'){
          console.log('Nope');
        }
        else {
          $rootScope.loginState = true;
          $cookies.put('token', result.token);
          $cookies.put('userId', userId);
          $state.go('home', {}, { reload: true });
        }
      }

      else {
        $state.go('signup');
      }
    });
  };
});

app.controller('SignupController', function($scope, $stateParams, $state, TwitterApi) {
  $scope.userSignup = function(userId, password, website, avatar_url) {
    TwitterApi.userSignup(userId, password, website, avatar_url).success(function(result) {
      console.log(result);
    });
    $state.go('login', {}, { reload: true });
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
      url: '/home',
      templateUrl: 'home.html',
      controller: 'HomeController'
    });
});
