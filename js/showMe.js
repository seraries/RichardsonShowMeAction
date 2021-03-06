var app = angular.module('showMeApp', []);
// filter resources by issue and create sections of bills (divs) for each issue type
app.filter('issueFilter', [ function() {
	return function(items, issue) {
		var filtered = [];
		var regex = "";
		switch (issue) {
			case "Gun Control":
			regex = /( guns?| firearms?| ammunitions?| NRA)/i;
			break;
			case "Health Care":
			regex = /( health care| medical| medicines?| healthcare| medicaid| diseases?| medication| Planned Parenthood)/i;
			break;
			case "Education":
			regex = /( educates?| education| teachers?| curriculum| school| charter schools?)/i;
			break;
			case "Civil Rights":
			regex = /( protected traits?| discriminat| human right| civil right)/i;
			break;
			case "Women's Rights":
			regex = /( abortions?| fetus| unborn| fetal remains| pregnancy| Planned Parenthood| woman| women| family planning| based on gender)/i;
			break;
			case "Criminal Justice":
			regex = /( criminals?| jails?| youth violence| crimes?| parole| imprison| acts of violence| drug courts?| child abuse| prosecution| law enforcement)/i;
			break;
			case "Environment":
			regex = /( toxic waste| environment| pollution| clean energy| solar)/i;
			break;
			case "Workers' Rights":
			regex = /( labor unions?| unemployment| living wage| workers| by their employers)/i;
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
// a directive to auto-collapse long text
// in elements with the "dd-text-collapse" attribute
app.directive('ddTextCollapse', ['$compile', function($compile) {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {

            // start collapsed
            scope.collapsed = false;

            // create the function to toggle the collapse
            scope.toggle = function() {
                scope.collapsed = !scope.collapsed;
            };

            // wait for changes on the text
            attrs.$observe('ddTextCollapseText', function(text) {

                // get the length from the attributes
                var maxLength = scope.$eval(attrs.ddTextCollapseMaxLength);

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart = String(text).substring(0, maxLength);
                    var secondPart = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan = $compile('<span>' + firstPart + '</span>')(scope);
                    var secondSpan = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                    var moreIndicatorSpan = $compile('<span ng-if="!collapsed">... </span>')(scope);
                    //var lineBreak = $compile('<br ng-if="collapsed">')(scope);
                    var toggleButton = $compile('<a href="" class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "less" : "more"}}</a>')(scope);

                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(secondSpan);
                    element.append(moreIndicatorSpan);
                    //element.append(lineBreak);
                    element.append(toggleButton);
                }
                else {
                    element.empty();
                    element.append(text);
                }
            });
        }
    };
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
  $scope.houseLength = 3;
  $scope.senateLength = 3;
  $scope.incrementHouse = function() {
    $scope.houseLength += 6;
  };
  $scope.resetHouse = function() {
    $scope.houseLength = 2;
  };
  $scope.incrementSenate = function() {
    $scope.senateLength += 6;
  };
  $scope.resetSenate = function() {
    $scope.senateLength = 2;
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
    // this changes the links for Your Senator and Your Representative to mailto: hrefs
    // is this call necessary or does it duplicate code above?
    if(!$scope.noContacts){
      $scope.replaceUserLegInfo();
    }
    // make the numeric sort of these bills accurate (after first sorting by type of bill, e.g., HB, HJR, etc., sort by number)
    angular.forEach($scope.allBills, function(bill){
      var billPrefixArray = bill.billNum.match(/HB|SB|HR|SR|HCR|HJR|SCR|SJR|SCB|HCB/); // get prefix as array
      // Set the prefix (alphabetic) part of the bill number as property of the bill
      bill.prefix = billPrefixArray[0]; // get prefix string from the array
      // get only the number part of the bill number and set as property of the bill
      bill.numberOnly = parseInt(bill.billNum.substring(bill.prefix.length)); // must make this a number to work right!     
    });
  });

    // get users email from local storage and bills Followed info from database
  // caused HOURS OF HEADACHES because I forgot to json parse this email string, therefore couldn't insert in db
  $scope.email = $window.localStorage.getItem("email");
  //initialize empty array of billsFollowed in case they sign up for emails and thus need this array
  $scope.billsFollowed = [];

  if($scope.email === null){
    $scope.noEmail = true;
  }
  else {
    // this time, I'll remember to PARSE THIS!!!
    $scope.email = JSON.parse($scope.email);
    
    $http.post("../php/getBillsFollowed.php", $scope.email).then(function(response) {
      // check if this is empty string--only do split if it is not empty!
      if (!(response.data[0] === "") || !(response.data[0] === null)) {
        var usersBills = response.data[0].billsFollowed; // usersBills should be comma separated string of bill numbers
        $scope.billsFollowed = usersBills.split(","); // split this string into an array of bill numbers
      }
    });
  }

  $scope.followBill = function(billNumber) {
    // check that bill's not already in there first
    var billNumIndex = $scope.billsFollowed.indexOf(billNumber);
    if (!(billNumIndex > -1)) {
      $scope.billsFollowed.push(billNumber);
      // object to send data to php
      var billFollowInfo = {};
      billFollowInfo.email = $scope.email;
      billFollowInfo.billNumbers = $scope.billsFollowed.join(); // join array elements into comma separated string
      // update database
      $http.post("../php/addOrRemoveBillToFollow.php", billFollowInfo).then(function(response){
      });
    }
  };

  $scope.unfollowBill = function(billNumber) {
      var billNumIndex = $scope.billsFollowed.indexOf(billNumber);
      if (billNumIndex > -1) {
        $scope.billsFollowed.splice(billNumIndex, 1); // remove this bill number from array
        var billFollowInfo = {};
        billFollowInfo.email = $scope.email;
        billFollowInfo.billNumbers = $scope.billsFollowed.join();
        $http.post("../php/addOrRemoveBillToFollow.php", billFollowInfo).then(function(response){

        });
      }
  };

  $scope.addEmail = function() {
    $window.localStorage.setItem("email", JSON.stringify($scope.newEmail));
    $http.post("../php/addActivist.php", $scope.newEmail).then(function(response) {
      $scope.noEmail = false;
    }); 
    $scope.email = $scope.newEmail;
    // In case they are already in database (from signing up on different device), get their bills followed
    $http.post("../php/getBillsFollowed.php", $scope.email).then(function(response) {
      // check if this is empty string--only do split if it is not empty!
      if (!(response.data[0] === "") || !(response.data[0] === null)) {
        var usersBills = response.data[0].billsFollowed; // usersBills should be comma separated string of bill numbers
        $scope.billsFollowed = usersBills.split(","); // split this string into an array of bill numbers
      }
    });
  };

  // Note: counting on always putting link at end of message string in announcements
  // later I can amend this to search for the index of the next space following the index of http (or the end of the string) and
  // that will be the end of the link and I can put that index as the end argument of substring()
  $http.get("../php/getAnnouncements.php").then(function(response) {
    $scope.announce = response.data;
    angular.forEach($scope.announce, function(each){
      linkIndex = each.message.indexOf("http");
      if (linkIndex > -1) {
        each.link = each.message.substring(linkIndex); // get the link from start of "http" to end of message
        each.message = each.message.substring(0, linkIndex); // now make message everything in the string up to the link
      }
    });
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
	$scope.addLegModal = false;
  $scope.addEmailModal = false;

	$scope.guns = false;
	$scope.education = false;
	$scope.health = false;
	$scope.civil = false;
	$scope.women = false;
	$scope.criminal = false;
	$scope.environ = false;
	$scope.workers = false;
  
	// make buttons using this array and use it for issues filtering
	$scope.issueTypes = [{name: "Education", show: "education"}, {name: "Health Care", show: "health"},  
	{name: "Civil Rights", show: "civil"}, {name: "Gun Control", show: "guns"}, {name: "Women's Rights", show: "women"}, 
	{name: "Criminal Justice", show: "criminal"}, {name: "Environment", show: "environ"}, {name: "Workers' Rights", show: "workers"}];

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

	// note: ng-show value won't override w3-hide class (had to remove from vertNav to get this to work)
	$scope.navFunction = function() {
		 $scope.showVertical = !$scope.showVertical;
	}
	
}]);