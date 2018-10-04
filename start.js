var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use('/', express.static(__dirname));
app.use(fileUpload());
var cookieParser= require('cookie-parser');
app.use(cookieParser('12345-67890-09876-54321'));
var md5 = require('md5');


var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/selloff';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  if(!err)
  {
	  database=db;
  }
});

var adduser = function(user) {
   database.collection('user').insertOne( {
      "fname" : user.fname,
      "mname" : user.mname,
      "lname" : user.lname,
      "uname" : user.uname,
      "pwd" : user.pwd,
      "mob" : user.mob
   }, function(err, result) {
    assert.equal(err, null);
    console.log("User Registered");
  });
};


var finduser = function(user,cb) {
   var cursor =database.collection('user').find( { "uname": user.uname, "pwd": user.pwd  } ).toArray(cb);;
};

var getuser = function(user,cb) {
   var cursor =database.collection('user').find( { "uname": user.uname} ).toArray(cb);;
};

app.post('/api/registeruser/', function(req, res) {
	var user={
		fname:req.body.fname,
		mname:req.body.mname,
		lname:req.body.lname,
		uname:req.body.uname,
		pwd:req.body.pwd,
		mob:req.body.mob
	}

	getuser(user, function(err, data){
            if (err) {
                console.log(err);
                
            } else {
                console.log(data);
				if(data.length>0)
				{
					return res.send(false);
				}	
				else
				{
					adduser(user);
					return res.send(true);
				}
					
            }
        });	
});

	
app.post('/api/finduser/', function(req, res) {
	var auth=req.headers.authorization.split(":");
	var username=auth[0];
	var passwd=auth[1];
	var user={
		uname:username,
		pwd:passwd
	}
	if(!req.signedCookies.user)
	{
		if(user.pwd==null){return res.send(false);}
		finduser(user, function(err, data){
            if (err) {
                console.log(err);
                
            } else {
                console.log(data);
				if(data.length>0)
				{
					res.cookie('user',user.uname,{signed:true});
					return res.send(true);
				}
					
				else
					return res.send(false);
            }
        });	
	}
	else
	{
		if(req.signedCookies.user==user.uname)
		{
			return res.send(true);
		}
		else
		{
			return res.send(false);
		}
	}
	
});	
		
app.post('/api/getuserdetails/', function(req, res) {
	
	var user={
	uname:req.body.uname};
	getuser(user, function(err, data){
            if (err) {
                console.log(err);
                return res.send(false);
            } else {
				if(!req.signedCookies.user)
					return res.send(false);
                console.log(data);
				if(data.length>0)
					return res.json({"fname":data[0].fname,"mname":data[0].mname,"lname":data[0].lname,"uname":data[0].uname,"mob":data[0].mob});
				else
					return res.send(false);
            }
        });
});	
		

//File upload
app.post('/api/fileupload/', function(req, res) {
	if(!req.signedCookies.user)
		return res.send(false);

	var sampleFile;
	var path = require('path');
	var fs   = require('fs');
    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }
	var type=req.body.type;
	if(type==1)
	{
		var sampleFile = req.files.Pic;
		var u_name = req.body.uname;
		var uname_hash = md5(u_name);
		console.log(u_name);
		console.log(uname_hash);
		var imgdir=path.join(path.dirname(fs.realpathSync(__filename)), '/imgs/');
		var prof_imgdir=imgdir+uname_hash;
		var prof_img=prof_imgdir+'/prof-pic.jpg'

		if (!fs.existsSync(prof_imgdir)){fs.mkdirSync(prof_imgdir);}
		sampleFile.mv(prof_img, function(err) {
		if (err) {
					res.status(500).send(err);
		}
		else {
				console.log('File uploaded!');
				res.send({success:true});
		}
		});
	}
	else if(type==2)
	{
		var sampleFile = req.files.Pic;
		var u_name = req.body.uname;
		database.collection('imagenum').findOne( { "uname": u_name },function(err, data){
			console.log(data);
			console.log(u_name);
			var numimg;
			if(data==null || data.length==0)
			{
				database.collection('imagenum').insertOne( {
				"uname" : u_name,
				"num" : 0
			   }, function(err, result) {
				assert.equal(err, null);
				console.log("Image Number Added Initially");
			  });
			  numimg=0;
			}
			if(data!=null){numimg=data.num+1;}
			var imgdir=path.join(path.dirname(fs.realpathSync(__filename)), '/imgs/public/');
			var prof_imgdir=imgdir;
			var imagenumhash=md5(u_name+numimg);
			var prof_img=prof_imgdir+'/'+imagenumhash+'.jpg'

			if (!fs.existsSync(prof_imgdir)){fs.mkdirSync(prof_imgdir);}
			sampleFile.mv(prof_img, function(err) {
			if (err) {
						res.status(500).send(err);
			}
			else {
					console.log('File uploaded!');
					database.collection('imagenum').update( {
						"uname" : u_name
					   },{$set:{ "uname" : u_name,
						"num" : numimg
					   }}, function(err, result) {
						assert.equal(err, null);
						console.log("Image Number Added");
					  });
					res.send({success:true,imageloc:'/imgs/public/'+imagenumhash+'.jpg'});
					
			}
			});
				
		});
	}
    

});







app.post('/api/itemdetails/',function(req,res){
	
	var description=req.body.description;
	var category=req.body.category;
	var imgloc=req.body.imgloc;
	var u_name=req.body.uname;
	var f_name=req.body.fullname;
	var mob=req.body.mob;
	var date=req.body.date;
	var cost=req.body.cost;
	var status=req.body.status;
	database.collection('imagenum').findOne( { "uname": u_name },function(err, data){
	if(data==null || data.length==0)
	{
		numimg=0;
	}
	else {numimg=data.num+1; console.log(numimg);}
	var imagenumhash=md5(u_name+numimg);
	var imageloc='/imgs/public/'+imagenumhash+'.jpg'
	database.collection('itemdetails').insertOne( { "uname": u_name, "fullname": f_name, "description": description, "category": category, "imgloc":imageloc, "mob":mob,"cost":cost,"date":date, "status":status}, function(err,data){
		console.log("Successfully Added Item Details");
		res.send({success:true});
	});
	});
});


app.post('/api/getitemdetails/',function(req,res){
	var uname=req.body.uname;
	var category=req.body.category;
	console.log(category);
	if(category=="All")
	{
		database.collection('itemdetails').find({"uname":{$ne:uname},"status":"Open for Sale"}).sort({"date":-1}).limit(100).toArray(function (err, items) {
        if (err) {
            reject(err);
          } else {
            console.log(items);
            res.send(items);
          }          
      });
	}
	else
	{
		database.collection('itemdetails').find({"uname":{$ne:uname},"category": category,"status":"Open for Sale"}).sort({"date":-1}).limit(100).toArray(function (err, items) {
        if (err) {
            reject(err);
          } else {
            console.log(items);
            res.send(items);
          }          
      });
	}
	
});

app.post('/api/getmyitemdetails/',function(req,res){
	var uname=req.body.uname;
	var category=req.body.category;
	console.log(category);
	if(category=="All")
	{
		database.collection('itemdetails').find({"uname": uname}).sort({"date":-1}).limit(100).toArray(function (err, items) {
        if (err) {
            reject(err);
          } else {
            console.log(items);
            res.send(items);
          }          
      });
	}
	else
	{
		database.collection('itemdetails').find({"category": category,"uname": uname}).sort({"date":-1}).limit(100).toArray(function (err, items) {
        if (err) {
            reject(err);
          } else {
            console.log(items);
            res.send(items);
          }          
      });
	}
	
});


app.post('/api/updatedescription/',function(req,res){
	var uname=req.body.uname;
	var description=req.body.description;
	var imgloc=req.body.imgloc;
	var date=req.body.date;
	database.collection('itemdetails').update({"uname": uname,"imgloc":imgloc,"date":date},{$set:{'description':description}},{multi:true},function (err, items) {
        if (err) {
            reject(err);
          } else {
            //console.log("hi");
            res.send({"success":true});
          }          
      });
	
});


app.post('/api/updatecost/',function(req,res){
	var uname=req.body.uname;
	var cost=req.body.cost;
	var imgloc=req.body.imgloc;
	var date=req.body.date;
	database.collection('itemdetails').update({"uname": uname,"imgloc":imgloc,"date":date},{$set:{'cost':cost}},{multi:true},function (err, items) {
        if (err) {
            reject(err);
          } else {
            res.send({"success":true});
          }          
      });
	
});



app.post('/api/updatestatus/',function(req,res){
	var uname=req.body.uname;
	var status=req.body.status;
	var imgloc=req.body.imgloc;
	var date=req.body.date;
	database.collection('itemdetails').update({"uname": uname,"imgloc":imgloc,"date":date},{$set:{'status':status}},{multi:true},function (err, items) {
        if (err) {
            reject(err);
          } else {
            //console.log("hi");
            res.send({"success":true});
          }          
      });
	
});


app.post('/api/updatemob/',function(req,res){
	var uname=req.body.uname;
	var mob=req.body.mob;
	database.collection('itemdetails').update({"uname": uname},{$set:{"mob":mob}},{multi:true},function (err, items) {
        if (err) {
            reject(err);
          } else {
            //console.log("hi");
			database.collection('user').update({"uname": uname},{$set:{"mob":mob}},{multi:true},function (err, items) {
				if (err) {
					reject(err);
				  } else {
					//console.log("hi");
					res.send({"success":true});
				  }          
			  });
          }          
      });
	
});

		
app.post('/api/logout/', function(req, res) {		
res.clearCookie("user");
res.send(true);	
});	
		
		
app.listen(3000, function () {
  console.log('App listening on port 3000!');
});