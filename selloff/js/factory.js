var mod1 = angular.module("mymodule", []);
mod1.factory("UserFactory",function($http){
	return {	
	adduser:function(user){
		return $http.post('http://'+window.location.host+'/api/registeruser',user);
		},
	login:function(user){
		$http.defaults.headers.common['Authorization'] = user.uname+':'+user.pwd;
		return $http.post('http://'+window.location.host+'/api/finduser');
		},
	getuserdetails:function(user){
		return $http.post('http://'+window.location.host+'/api/getuserdetails',user);
		},
	logout:function(user){
		return $http.post('http://'+window.location.host+'/api/logout',user);
		},
	fileupload:function(formData){
		return $http.post('http://'+window.location.host+'/api/fileupload',formData, {
		transformRequest: angular.identity,
		headers: {'Content-Type': undefined}}
		);
	},
	itemdetails:function(itemdetails){
		return $http.post('http://'+window.location.host+'/api/itemdetails',itemdetails);
	},
	getitemdetails:function(itemcategory){
		return $http.post('http://'+window.location.host+'/api/getitemdetails',itemcategory);
	},
	getmyitemdetails:function(itemname){
		return $http.post('http://'+window.location.host+'/api/getmyitemdetails',itemname);
	},
	updatedescription:function(description){
		return $http.post('http://'+window.location.host+'/api/updatedescription',description);
	},
	updatecost:function(cost){
		return $http.post('http://'+window.location.host+'/api/updatecost',cost);
	},
	updatestatus:function(status){
		return $http.post('http://'+window.location.host+'/api/updatestatus',status);
	},
	updatemob:function(mobno){
		return $http.post('http://'+window.location.host+'/api/updatemob',mobno);
	},
	};
});