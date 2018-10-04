mainApp.controller("Register",function($scope,md5,$window,UserFactory){
	$scope.$watch('Password', function(newValue,oldValue){
		if($scope.Password==$scope.ConfirmPassword && $scope.Password!=null && $scope.Password!="")
		{
			$scope.passwordvalid=true;
		}
		else
		{
			$scope.passwordvalid=false;
		}
	});
	$scope.$watch('ConfirmPassword', function(newValue,oldValue){
		if($scope.Password==$scope.ConfirmPassword && $scope.Password!=null && $scope.Password!="")
		{
			$scope.passwordvalid=true;
		}
		else
		{
			$scope.passwordvalid=false;
		}
	});
	
	$scope.adduser=function(){
	var passwd=md5.createHash($scope.Password);
	UserFactory.adduser({"fname":$scope.fname,"mname":$scope.mname,"lname":$scope.lname,"uname":$scope.username,"pwd":passwd,"mob":$scope.mobile}).success(function(data){
		if(data=="true"){alert('User added.Please try to login');$window.location.href="#/home";}
		else
		{$scope.err="User already exists. Please use another username or email"}
	});	
	};
	
});



mainApp.controller("Login",function($scope,md5,$window,UserFactory){
	$scope.finduser=function(){
		var passwd=md5.createHash($scope.Password);
		UserFactory.login({"uname":$scope.username,"pwd":passwd}).success(function(data){
			if(data=="true"){$window.location.href="#/userpage?uname="+$scope.username;}
			else{$scope.err="Wrong Credentials. Please enter your username and password again"}
				});	
	};
});


mainApp.controller("Userpage",function($scope,md5,$window,$location,UserFactory){
	getUrlVars = function(){
		url=$location.url();
		var queryparams=url.split('?')[1].split('&');
		var querylist={}
		for(var i=0;i<queryparams.length;i++)
		{
			j=queryparams[i].split('=');
			querylist[j[0]]=j[1];
		}
		return querylist;
	};
	$scope.submitbuttondisabled=false;
	$scope.user={uname:"",fname:"",mname:"",lname:"",mob:""};
	$scope.imgloc="";
	var list=getUrlVars();
	$scope.user.uname=list["uname"];
	$scope.imgdir=md5.createHash($scope.user.uname);
	$scope.random = (new Date()).toString();
	UserFactory.getuserdetails({"uname":$scope.user.uname}).success(function(data){
		if(data=="false"){$window.location.href="#/home"}
		else{$scope.user.fname=data.fname;
		$scope.user.mname=data.mname;
		$scope.user.lname=data.lname;
		$scope.user.mob=data.mob;
		}
			});
			
	$scope.options=function(){
		if($scope.sel1=="Logout"){
			UserFactory.logout().success(function(data){
			if(data=="true"){$window.location.href="#/home";}
			});
		}
		else if($scope.sel1=="Account Details")
		{
			$window.location.href="#/userdetailspage?uname="+$scope.user.uname;
		}
		else if($scope.sel1=="My Ads")
		{
			$window.location.href="#/myads?uname="+$scope.user.uname;
		}
		
	}
	
	$scope.upload=function(type,pictag){
		
		oFReader = new FileReader(), rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

		oFReader.onload = function (oFREvent) {

		
		function dataURItoBlob(dataURI)
		{
			var byteString = atob(dataURI.split(',')[1]);

			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

			var ab = new ArrayBuffer(byteString.length);
			var ia = new Uint8Array(ab);
			for (var i = 0; i < byteString.length; i++)
			{
				ia[i] = byteString.charCodeAt(i);
			}

			var bb = new Blob([ab], { "type": mimeString });
			return bb;
		}
		
		
		var img=new Image();
		img.onload=function(){
			var canvas=document.createElement("canvas");
			var ctx=canvas.getContext("2d");
			canvas.width=300;
			canvas.height=300;
			ctx.drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);
			var dataURL=canvas.toDataURL();
			var blob = dataURItoBlob(dataURL);
			
			var formData = new FormData();
			formData.append('Pic',blob);
			formData.append('uname',$scope.user.uname);
			formData.append('type',type);
			UserFactory.fileupload(formData).success(function(data){
			if(data.success==true){$scope.random = (new Date()).toString();}
			else{alert("Image not uploaded. Please upload again");}
			});
		}
		  img.src=oFREvent.target.result;
		};
		
			if (document.getElementById(pictag).files.length === 0) {alert('You have not uploaded anything. Please try to upload.');}
			var pic = document.getElementById(pictag).files[0];
			if (!rFilter.test(pic.type)) { alert("You must select a valid image file!");}
			oFReader.readAsDataURL(pic);
			
	}
	
	$scope.advertise=function(){
		$scope.upload(2,"itemPic");
		var itemdesc=document.getElementById("itemdesc").value;
		console.log($scope.random);
		itemdetails={uname:$scope.user.uname,fullname:$scope.user.fname+" "+$scope.user.mname+" "+$scope.user.lname,description:itemdesc,category:$scope.category,mob:$scope.user.mob,cost:$scope.itemcost,date:(new Date()).toString(),status:"Open for Sale"};
		UserFactory.itemdetails(itemdetails).success(function(data){
			if(data.success==true){alert("Details Uploaded");$scope.submitbuttondisabled=true;}
		});
	}
	
	
	$scope.getads=function(){
		itemcategory={uname:$scope.user.uname,category:$scope.category};
		UserFactory.getitemdetails(itemcategory).success(function(data){
			$scope.items=data;
		});
	}
	
	$scope.getmyads=function(){
		itemdet={uname:$scope.user.uname,category:$scope.category};
		UserFactory.getmyitemdetails(itemdet).success(function(data){
			$scope.myitems=data;
		});
	}
	
	
	//Edit Description details:
	$scope.descriptioneditorEnabled=new Array(1000).fill(false);
	$scope.costeditorEnabled=new Array(1000).fill(false);
	$scope.descriptioneditableTitle=new Array(1000);
	$scope.costeditableTitle=new Array(1000);
	
	$scope.enabledescriptionEditor = function(num) {
    $scope.descriptioneditorEnabled[num] = true;
    $scope.descriptioneditableTitle[num] = $scope.myitems[num].description;
  };
  
  
  $scope.descriptiondisableEditor = function(num) {
    $scope.descriptioneditorEnabled[num] = false;
  };
  
  $scope.descriptionsave = function(num) {
	var descriptiondetails={uname:$scope.user.uname,date:$scope.myitems[num].date,imgloc:$scope.myitems[num].imgloc,description:$scope.descriptioneditableTitle[num]};
	UserFactory.updatedescription(descriptiondetails).success(function(data){
			$scope.myitems[num].description = $scope.descriptioneditableTitle[num];
			$scope.descriptiondisableEditor(num);
		});
    
  };
	
	// Edit Cost details
	
	$scope.enablecostEditor = function(num) {
    $scope.costeditorEnabled[num] = true;
    $scope.costeditableTitle[num] = $scope.myitems[num].cost;
  };
  
  
  $scope.costdisableEditor = function(num) {
    $scope.costeditorEnabled[num] = false;
  };
  
  $scope.costsave = function(num) {
	var cost={uname:$scope.user.uname,date:$scope.myitems[num].date,imgloc:$scope.myitems[num].imgloc,cost:$scope.costeditableTitle[num]};
	UserFactory.updatecost(cost).success(function(data){
			$scope.myitems[num].cost = $scope.costeditableTitle[num];
			$scope.costdisableEditor(num);
		});
	  
    
  };
  
  //Change Status
  $scope.changestatus = function(num) {
	var tempstatus="";
	if($scope.myitems[num].status=="Sold")
		 tempstatus="Open for Sale"
	else
		 tempstatus="Sold"
	var statusdetails={uname:$scope.user.uname,date:$scope.myitems[num].date,imgloc:$scope.myitems[num].imgloc,status:tempstatus};
	UserFactory.updatestatus(statusdetails).success(function(data){
			$scope.myitems[num].status = tempstatus;
		}); 
  };
	
	
  // Edit Mobile Number details
	
	
	
  $scope.enablemobEditor = function() {
    $scope.mobeditorEnabled = true;
    $scope.mobeditableTitle = $scope.user.mob;
  };
  
  
  $scope.mobdisableEditor = function() {
    $scope.mobeditorEnabled = false;
  };
  
  $scope.mobsave = function() {
	if($scope.mobeditableTitle.toString().length==10)
	{
		var mobno={uname:$scope.user.uname,mob:$scope.mobeditableTitle};
		UserFactory.updatemob(mobno).success(function(data){
			$scope.user.mob = $scope.mobeditableTitle;
			$scope.mobdisableEditor();
		});
	}
	else
	{
		alert("Please enter 10 digits for a valid mobile number");
	}
	  
    
  };
	
});
