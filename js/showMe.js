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
		// putting this here displays bill data on page open but doesn't dynamically update it
  $http.get("../php/getBills.php").then(function(response) {
    $scope.allBills = response.data;
  });
	// get contact info to fill select boxes
	$http.get("../php/getContacts.php").then(function(response) {
    $scope.contacts = response.data;
  });
  // get announcement info to both display and to fill select box for delete/edit announce forms
  $http.get("../php/getAnnouncements.php").then(function(response) {
    $scope.announce = response.data;
  });

	$scope.showVertical = false; // use for responsive navbar
	$scope.loginVisible = false; // use to show login if navbar click
	$scope.deleteModal = false;
	$scope.insertModal = false;
	$scope.editModal = false;
	//$scope.addContactModal = false;  don't have add contact section in this html, only in not
	$scope.addAnnounceModal = false;
	$scope.editAnnounceModal = false;
	$scope.deleteAnnounceModal = false;
	$scope.showFailedLogin = false;
	// result of login: determines display of insert and delete forms.
	$scope.isValidLogin = false; 

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
	// Eventually move these to DB as I did with committees
	$scope.authors = ["Rep. Joe Adams", "Rep. Lauren Arthur", "Sen. Kiki Curls", "Rep. Bruce Franks Jr.", "Rep. Deb Lavender", "Rep. Tracy McCreery",
		"Rep. Stacey Newman", "Rep. Crystal Quade", "Sen. Jill Schupp", "Rep. Cora Faith Walker"];
	//TODO: ADD a custom orderBy/Filter to put authors in the announce forms' select boxes in order of last name
	// either as a string--split on spaces into array and compare 3rd element or as object.lastname
	
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
	$scope.isValidLink = function(link) {
		var linkRE = /^(#|http:\/\/www\.senate\.mo\.gov|http:\/\/www\.house\.mo\.gov)/;
		return linkRE.test(link);
	}
	$scope.isValidContact = function(contactName) {
		var contactRE = /^(House|Senate)/;
		return contactRE.test(contactName);
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

	$scope.billToDelete = {};
	$scope.deleteSubmit = function() {
		if($scope.isValidLogin) {
			$http.post("../php/deleteBill.php", $scope.billToDelete.billNum).then(function(response) {
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
			$http.post("../php/findBill.php", $scope.editDetails.id.billNum).then(function(response) {
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
			$scope.editDetails.id = $scope.editDetails.id.billNum;
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
		/*
		$scope.addContactSubmit = function() {
		if($scope.isValidLogin) {
			$http.post("../php/addContact.php", $scope.addContact).then(function(response) {
			// get array of contacts again from database so I can update the ng-repeat scope object for contacts
			$scope.contacts = response.data;
				// reset form when done
				$scope.addContact.title = "";
				$scope.addContact.link = "";
				$scope.addContactForm.$setUntouched();
			});	
		}
	} */

		$scope.addAnnounceSubmit = function() {
		if($scope.isValidLogin) {
			$http.post("../php/addAnnouncement.php", $scope.addAnnounce).then(function(response) {
				// get array of announcements again (newly updated)
				$scope.announce = response.data;
				// reset form when done
				$scope.addAnnounce = {};
				$scope.addAnnounceForm.$setUntouched();
			});	
		}
	}

	$scope.findAnnounce = function() {
		if($scope.isValidLogin) {
			$http.post("../php/findAnnouncement.php", $scope.editAnnounce.title.title).then(function(response) {
				// only getting back one matching bill, hence [0]. Set form details to match database 
				$scope.editAnnounce.message = response.data[0].message; 
				$scope.editAnnounce.author = response.data[0].author; 

			});
		}
	}
		$scope.editAnnounceSubmit = function() {
		if($scope.isValidLogin) {
			$scope.editAnnounce.title = $scope.editAnnounce.title.title; // since I get an object from select box
			$http.post("../php/editAnnouncement.php", $scope.editAnnounce).then(function(response) {
				// get array of announcements again (newly updated)
				$scope.announce = response.data;
				// reset form when done
				$scope.editAnnounce = {};
				$scope.editAnnounceForm.$setUntouched();
			});	
		}
	}
	$scope.deleteTitle = {}; // think I have to declare this an object before using it below.
		$scope.deleteAnnounceSubmit = function() {
		if($scope.isValidLogin) {
			$http.post("../php/deleteAnnouncement.php", $scope.deleteTitle.title).then(function(response) {
				// get array of announcements again (newly updated)
				$scope.announce = response.data;
				// reset form when done
				//$scope.deleteTitle = "";
				$scope.deleteAnnounceForm.$setUntouched();
			});	
		}
	}
	
}]);