let BlogApp = angular.module('BlogApp',[]);

BlogApp.controller('EditController', ($scope, $http) => {
	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0; i<vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] == variable) {
				return pair[1];
			}
		}
		return(false);
	}
	let apiUrl = getQueryVariable('post_link');
	$http({
		method:'GET',
		url:'/api?target=blog&post_link='+apiUrl
	}).then((res) => {
		res.data.title = res.data.title.replace(/&#96;/g,"\`").replace(/&quot;/g,"\"").replace(/&apos;/g,"\'");
		res.data.body = res.data.body.replace(/&#96;/g,"\`").replace(/&quot;/g,"\"").replace(/&apos;/g,"\'");
		$scope.data = res;
	}, (err) => {
		alert(err);
	});
});