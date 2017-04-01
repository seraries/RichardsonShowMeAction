var app = angular.module('startApp', []);
	app.controller('startCtrl', ['$scope', '$http', function($scope, $http) {
		$scope.showVertical = false;
		$scope.navFunction = function() {
	 		$scope.showVertical = !$scope.showVertical;
	}

	$scope.isValidLogin = false;
	
	$scope.loginSubmit = function() {
		if ($scope.loginForm.$valid) {
	    $http.post("../php/Login.php", $scope.loginInfo).then(function(response) {
	      // hide login and show insert and delete bill forms
	      if(response.data.message === "ok") {
	      	$scope.isValidLogin = true;
	      }
	      else {
	      	$scope.showFailedLogin = true;
	      }
			});
		}
	}
}]);