BlogApp.controller('EditController',($scope,$http)=>{
	function getQueryVariable(variable){
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if(pair[0] == variable){
				return pair[1];
			}
		}
		return(false);
	}
	let apiUrl = getQueryVariable('id');
	$http({
		method:'GET',
		url:'/api?target=blog&post_title='+apiUrl
	}).then((res)=>{
		$scope.data = res;
	},(err)=>{
		alert(err);
	});
});
