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
			regex = /( abortions?| fetus| unborn| fetal remains| pregnancy| Planned Parenthood| woman| family planning| based on gender)/i;
			break;
			case "Criminal Justice":
			regex = /( criminals?| jails?| youth violence| crimes?| parole| imprison| acts of violence| drug courts?| child abuse| prosecution| law enforcement)/i;
			break;
			case "Environment":
			regex = /( toxic waste| environmental| pollution| clean energy| solar)/i;
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
                    var toggleButton = $compile('<span class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "less" : "more"}}</span>')(scope);

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