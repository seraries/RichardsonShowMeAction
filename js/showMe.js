var app = angular.module('showMeApp', []);
app.controller('showMeCtrl', ['$scope', '$window', '$http', function($scope, $window, $http) {

	// these filters select bills for display from allBills based on branch of gov
	$scope.houseFilter = function(element){
			if (element.branch === "house") {
				return true;
			}
	};
	$scope.senateFilter = function(element){
			if (element.branch === "senate") {
				return true;
			}
	};		

	// putting this here displays data on page open but doesn't dynamically update it
  $http.get("../php/getBills.php").then(function(response) {
    $scope.allBills = response.data;
  });
	$scope.showVertical = false; // use for responsive navbar
	$scope.loginVisible = false; // use to show login if navbar click
	$scope.deleteModal = false;
	$scope.insertModal = false;
	$scope.editModal = false;
	$scope.showFailedLogin = false;
	// result of login: determines display of insert and delete forms.
	$scope.isValidLogin = false; 	// SETTING THIS TO TRUE WHILE TESTING

	// Don't know if I need to declare this here or not, play around later with it
	$scope.billDetails = {
		id: "",
		link: "", 
		branch: "",
		vote: "",
		why: "",
		who: "",
		linkToWho: ""
	};

	// use this to send info on contact (title and link) to db for each bill
	// based on form selection (store it by bill because I'll need to load it on page load)
	$scope.contacts = [
		{title: "Your Senator", link: ""},
		{title: "Your Representative", link: ""},
		{title: "Senate Commerce, Consumer Protection, Energy and the Environment Committee", link: "http://www.senate.mo.gov/commerce/"},
		{title: "Senate Seniors, Families, and Children Committee", link: "http://www.senate.mo.gov/sfch/"},
		{title: "Senate Economic Development Committee", link: "http://www.senate.mo.gov/edev/"},
		{title: "House Children and Families Committee", link: "http://www.house.mo.gov/CommitteeIndividual.aspx?com=1423&year=2017&code=R"},
		{title: "House Crime Prevention and Public Safety Committee", link: "http://www.house.mo.gov/CommitteeIndividual.aspx?com=1427&year=2017&code=R"},
		{title: "House Health and Mental Health Policy Committee", link: "http://www.house.mo.gov/CommitteeIndividual.aspx?com=01435&year=2017&code=R"},
		{title: "House Rules-Administrative Oversight Committee", link: "http://www.house.mo.gov/CommitteeIndividual.aspx?com=01443&year=2017&code=R"},
		{title: "House Special Committee on Litigation Reform", link: "http://www.house.mo.gov/CommitteeIndividual.aspx?com=01452&year=2017&code=R"},
	];
	// put Our Rep and Our Senator (which have link value of #) first in options
	$scope.contactFilter = function(x) {
		if (x.link === "") {
			return x.link;
		}
		else {
			return x.title;
		}
	}
	// note: ng-show value won't override w3-hide class (had to remove from vertNav to get this to work)
	$scope.navFunction = function() {
		 $scope.showVertical = !$scope.showVertical;
	}
	$scope.showLogin = function() {
		$scope.loginVisible = true;
	}

	$scope.isValidBill = function(billNumber) {
		var billRE = /^(HCR|HB|SCR|SB)\d+$/;
		return billRE.test(billNumber);
	}
	$scope.isValidLink = function(billLink) {
		var linkRE = /^(#|http:\/\/www\.senate\.mo\.gov|http:\/\/www\.house\.mo\.gov)/;
		return linkRE.test(billLink);
	}
	$scope.loginSubmit = function() {
		if ($scope.loginForm.$valid) {
	    $http.post("../php/Login.php", $scope.loginInfo).then(function(response) {
	      // hide login and show insert and delete bill forms
	      if(response.data.message === "ok") {
	      	$scope.isValidLogin = true;
	      	$scope.loginVisible = false;
	      	// userLogin.username = $scope.loginInfo.username;
	      	// userLogin.password = $scope.loginInfo.password;
	      	$scope.loginInfo.username = "";
	      	$scope.loginInfo.password = "";
	      }
	      else {
	      	$scope.showFailedLogin = true;
	      }
	    });
		}
	}

	$scope.insertSubmit = function() {
		// all other deets for the bill object but these should be supplied by the model in html
		$scope.billDetails.who = $scope.contact.title;
		$scope.billDetails.linkToWho = $scope.contact.link; 
		if($scope.billDetails.link === "") {
			$scope.billDetails.link = "#"; //default for href
		} 
		if($scope.isValidLogin) {
			$http.post("../php/insertBill.php", $scope.billDetails).then(function(response) {
			// get array of bills again from database so I can update the ng-repeat scope object for bills
			$scope.allBills = response.data;
				// reset form when done
				$scope.billDetails = {};
				$scope.contact = ""; // resets the select box
				$scope.insertForm.$setUntouched();
			});	
		}
	}

	$scope.deleteSubmit = function() {
		if($scope.isValidLogin) {
			$http.post("../php/deleteBill.php", $scope.billToDelete).then(function(response) {
			// get array of bills again from database so I can update the ng-repeat scope object for bills
			$scope.allBills = response.data;
				// reset form when done
				$scope.billToDelete = "";
				$scope.deleteForm.$setUntouched();
			});	
		}
	}

	$scope.findBill = function() {
		if($scope.isValidLogin) {
			$http.post("../php/findBill.php", $scope.editDetails.id).then(function(response) {
				// only getting back one matching bill, hence [0]. Set form details to match database 
				$scope.editDetails.link = response.data[0].billLink; 
				$scope.editDetails.branch = response.data[0].branch; 
				$scope.editDetails.vote = response.data[0].position; 
				$scope.editDetails.why = response.data[0].why; 

				//loop through contacts and search for object with title that mathces response's contactTitle
				var result = $.grep($scope.contacts, function(obj){
					return obj.title === response.data[0].contactTitle;
				});
				// now set ng-model of select to match this array object
				$scope.editDetails.who = result[0]; 
			});
		}
	}

	$scope.editSubmit = function() {
		if($scope.isValidLogin) {
			// before submitting, need to assign these editDetails to the select box option 
			// they won't be automatically updated.
			$scope.editDetails.linkToWho = $scope.editDetails.who.link; // IMP! This must come before next stmt
			// Since this stmt below will reset what editDetails.who points to!!!
			$scope.editDetails.who = $scope.editDetails.who.title;
	
			$http.post("../php/editBill.php", $scope.editDetails).then(function(response) {
				// get array of bills again from database so I can update the ng-repeat scope object for bills
				$scope.allBills = response.data;
				// reset form when done
				$scope.editDetails = {};
				$scope.editForm.$setUntouched();
			});	
		}
	}
	
}]);