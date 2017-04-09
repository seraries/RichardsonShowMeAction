var app = angular.module('showMeApp', []);
// filter resources by issue and create sections of bills (divs) for each issue type
app.filter('issueFilter', [ function() {
	return function(items, issue) {
		var filtered = [];
		var regex = "";
		switch (issue) {
			case "Gun Control":
			regex = /( guns?| firearms?| ammunitions?)/i;
			break;
			case "Health Care":
			regex = /( health care| medical| medicines?| healthcare| medicaid| diseases?)/i;
			break;
			case "Education":
			regex = /( educates?| education| teachers?| curriculum| charter schools?)/i;
			break;
			case "Civil Rights":
			regex = /( protected traits?| discriminate| discrimination| discriminatory| human rights)/i;
			break;
			case "Women's Rights":
			regex = /( abortions?| fetus| unborn| fetal remains| pregnancy| family planning)/i;
			break;
		}
		angular.forEach(items, function(bill) {
		// if this string--the bill summary and talking points--contains the regex, add this bill to the array
    	// and do so only if the bill is not marked inactive
    	if(regex.test(bill.why) && !(bill.branch==="inactive")) {
    		filtered.push(bill);
    	}
		});
		return filtered;
	}
}]);

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
	$scope.govFilter = function(element){
		if (element.branch === "gov") {
			return true;
		}
	};
	$scope.replaceUserLegInfo = function(){
  	angular.forEach($scope.allBills, function(item){
  		// if they've reset their leg info (removed it from local storage)
  		if (($scope.senator === null) || ($scope.rep === null)) {
				if((item.contactTitle === "Your Senator") || (item.contactTitle === "Your Representative")){
	  			item.contactLink = "";
	  			item.phone = "";
  			}
  		}
  		// else they are adding it, so change the info in allBills array to match it.
  		else {
  			if(item.contactTitle === "Your Senator"){
	  			item.contactLink = $scope.senator.email;
	  			item.phone = $scope.senator.number;
  			}
  			else if(item.contactTitle === "Your Representative"){
	  			item.contactLink = $scope.rep.email;
	  			item.phone = $scope.rep.number;
  			}
  		}
  	});	
  };	
  // get contact count; create var if not there in local storage already
  $scope.numContacts = $window.localStorage.getItem("numContacts");
  if ($scope.numContacts === null) {
  	$scope.numContacts = 0;
  	$window.localStorage.setItem("numContacts", $scope.numContacts);
  }
  else {
  	$scope.numContacts = parseInt($scope.numContacts);
  }
	// get user's rep and sen if stored in local storage, will get back either an object, or null
  $scope.senator = $window.localStorage.getItem("senator"); 
  $scope.rep = $window.localStorage.getItem("rep");

  if(($scope.senator === null) || ($scope.rep === null)){
  	$scope.noContacts = true;
  }
  else {
  	$scope.senator = JSON.parse($scope.senator);
  	$scope.rep = JSON.parse($scope.rep);
  	$scope.noContacts = false;
  	$scope.replaceUserLegInfo();
  }

  // putting this here displays bill data on page open but doesn't dynamically update it
  $http.get("../php/getBills.php").then(function(response) {
    $scope.allBills = response.data;
    // for users--not admin, whose reloads with form submits will negate this--this changes
    // the links for Your Senator and Your Representative to mailto: hrefs
    // is this call a duplicate of js85-90
    if(!$scope.noContacts){
    	$scope.replaceUserLegInfo();
    }
  });
	// get contact info to fill select boxes
	$http.get("../php/getContacts.php").then(function(response) {
    $scope.contacts = response.data;
  });
  // get announcement info to both display and to fill select box for delete/edit announce forms
  $http.get("../php/getAnnouncements.php").then(function(response) {
    $scope.announce = response.data;
  });

  $scope.addLeg = function() {
  	$scope.senator.email = "mailto:" + $scope.senator.email; 
  	$scope.rep.email = "mailto:" + $scope.rep.email; 
  	$window.localStorage.setItem("senator", JSON.stringify($scope.senator));
  	$window.localStorage.setItem("rep", JSON.stringify($scope.rep));
  	$scope.noContacts = false;
  	$scope.replaceUserLegInfo();

  }
  $scope.removeLeg = function() {
  	$scope.senator = null;
  	$scope.rep = null;
  	$window.localStorage.removeItem("senator");
  	$window.localStorage.removeItem("rep");
  	$scope.replaceUserLegInfo();
  	$scope.noContacts = true;
  	$scope.showRemoveWarning = false;
  }
  $scope.updateCount = function() {
  	$scope.numContacts += 1;
  	$window.localStorage.setItem("numContacts", $scope.numContacts);
  }
  $scope.showRemoveWarning = false;
	$scope.showVertical = false; // use for responsive navbar
	$scope.loginVisible = false; // use to show login if navbar click
	$scope.deleteModal = false;
	$scope.insertModal = false;
	$scope.editModal = false;
	//$scope.addContactModal = false;  
	$scope.addAnnounceModal = false;
	$scope.editAnnounceModal = false;
	$scope.deleteAnnounceModal = false;
	$scope.showFailedLogin = false;
	// result of login: determines display of insert and delete forms.
	$scope.isValidLogin = false; 
	$scope.billDupeError = false;

	$scope.guns = false;
	$scope.education = false;
	$scope.health = false;
	$scope.civil = false;
	$scope.women = false;
	// make buttons using this array and use it for issues filtering
	$scope.issueTypes = [{name: "Education", show: "education"}, {name: "Health Care", show: "health"},  
	{name: "Civil Rights", show: "civil"}, {name: "Gun Control", show: "guns"}, {name: "Women's Rights", show: "women"}];

	$scope.toggleBtn = function(showString) {
		// make the other buttons' bills disappear
		// for each issue type, if its show value is not equal to showString, set the scope.showValue to false
		angular.forEach($scope.issueTypes, function(issue){
			if (issue.show != showString) {
				$scope[issue.show] = false;
			}
		});
		// make this button's bills either appear or disappear	
	  	$scope[showString] = !$scope[showString];
  }

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
	$scope.authors = ["Rep. Joe Adams", "Rep. Lauren Arthur", "Rep. Michael Butler", "Sen. Kiki Curls", 
	"Rep. Brandon Ellington", "Rep. Bruce Franks Jr.", "Rep. Deb Lavender", "Rep. Tracy McCreery", 
	"Rep. Sue Meredith", "Rep. Peter Merideth", "Rep. Gina Mitten", "Rep. Judy Morgan", "Rep. Jay Mosley", "Rep. Stacey Newman", 
	"Rep. Joshua Peters", "Rep. Crystal Quade", "Sen. Jill Schupp", "Rep. Martha Stevens", "Rep. Cora Faith Walker"];
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
		var billRE = /^(HCR|HB|SCR|SB|SJR|HJR)\d+/; // removed $ at end of regex string so sister bills can be added
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
	// preliminary check before adding bill, called when bill id field loses focus
	// this only checks current array of allBills--the check done on the back end
	// in the insertSubmit function will check the database in case another user
	// added a bill that doesn't appear in this user's current array (and will update this user's array)
	$scope.checkDupe = function() {
		if($scope.billDetails.id === ""){
			// do nothing, no bill num entered
		}
		else {
			for(i=0; i<$scope.allBills.length; i++) {
				if ($scope.allBills[i].billNum === $scope.billDetails.id) {
					$scope.billDupeError = true;
				}
				else {
					$scope.billDupeError = false;
				}
			}
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
				// check database for duplicate (instead of just current array, as above)
				if(response.data.message === "dupe"){
					$scope.billDupeError = true; // even though this was a dupe, go ahead and 
					// update array in case someone else just entered this bill and it isn't showing up 
					// on current user's computer. But this prob. doesn't happen since i'm using ng-blur 
					// to check dupes before it gets to back end
					 $http.get("../php/getBills.php").then(function(response) {
    				$scope.allBills = response.data;
  				});

				}
				else {
					// get array of bills again from database so I can update the ng-repeat scope object for bills
					$scope.allBills = response.data;
					// reset form when done
					$scope.billDetails = {};
					$scope.contact = ""; // resets the select box
					$scope.insertForm.$setUntouched();
				}
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