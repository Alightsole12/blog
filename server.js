// BUG: It thinks the tablets screen is too small because of chrome's bloaty url bar
// Middlewares
const http = require('http'),
	fs = require('fs'),
	express = require('express'),
	bodyParser = require('body-parser'),
	helmet = require('helmet'),
	ejs = require('ejs'),
	multer = require('multer'),
	pg = require('pg');

// SET ENV VARIABLES
const ip = '192.168.2.9';
var port = process.env.PORT || 8000;
var debug = process.env.debug || true;
if(typeof debug == 'string')
	debug = false;
const finish = typeof debug;

//client.connect(); // Connecting to the database
//const query = client.query( // Making the query // Title, txt link on server, date posted, 
	//`CREATE TABLE blog(
		//title varchar(255),
		//date date,
		//link varchar(255)
	//);`
//);
//query.on('end',()=>{client.end();}); // Once the query is complete, the client will close

// App Setup
const App = express();
App.set('views','./views');
App.use(express.static('public'));
App.use(bodyParser.urlencoded({extended:false}));
App.use(bodyParser.json());
App.use(helmet());
App.use(multer({dest:'./uploads'}).any()); // We may need to change this in the future
App.set('view engine','ejs');

// Routing
// The homepage of the site
App.get('/',(req,res)=>{
	res.send("Hello world! <a href='/blog'>Blog</a>");
});

// The main blog page
App.get('/blog',(req,res)=>{
	fs.readFile("data/recent.json","utf-8",(err,data)=>{
		const recent = JSON.parse(data).recent;
		console.log(`URL Query: ${req.query.page}`);
		console.log(recent[0]);
		var recentPosts = [];
		for(var i = 0; i<= 4; i++){
			recentPosts.push(recent[i*req.query.page]);
		}
		console.log(recentPosts);
		res.render("blog",{"recents":recentPosts});
	});
});

// A specific blog post
App.get('/blog/post/*',(req,res)=>{
	const urlData = req.url.split("/");
	const postLink = `public/posts/${urlData[2]}/${urlData[3]}/${urlData[4]}/${urlData[5]}.json`;
	const renderPost = ()=>{
		fs.readFile(postLink,"utf-8",(err,data)=>{
			res.render("post",JSON.parse(data));
		});
	};
	fs.stat(postLink,(err,stat)=>{
		if(err == null)
			renderPost();
		else
			res.redirect("/404");
	});
});

// A standard 404 page
App.get('/404',(req,res)=>{
	const punArray = ["A friend of mine tried to annoy me with bird puns, but I soon realized that toucan play at that game.", "Have you ever tried to eat a clock? It's very time consuming.", "Police were called to a daycare where a three-year-old was resisting a rest.", "I couldn't quite remember how to throw a boomerang, but eventually it came back to me.", "Simba was walking too slow, so I told him to Mufasa.", "Why is Peter Pan always flying? He neverlands! I love this joke because it never grows old.", "Jokes with punch lines can be painfully funny.", "A man died today when a pile of books fell on him. He only had his shelf to blame.", "What do you call a dinosaur with an extensive vocabulary? A Thesaurus.", "What happens when four children lock themselves in a wardrobe? That's narnia business..", "Why was Cinderella thrown off the basketball team? She ran away from the ball.", "My first job was working in an orange juice factory, but I got canned: couldn't concentrate.", "I wanna make a joke about sodium, but Na..", "Did you hear about the Italian chef with a terminal illness? He pastaway.", "An expensive laxative will give you a run for your money.", "I never understood odourless chemicals, they never make scents.", "Never trust an atom, they make up everything!", "When two vegetarians are arguing, is it still considered beef?", "I stayed up all night to see where the sun went. Then it dawned on me.", "When life gives you melons, you're probably dyslexic.", "I make apocalypse jokes like there's no tomorrow.", "No matter how hard you push the envelope it will still be stationery.", "What tea do hockey players drink? Penaltea!", "Did you hear about the guy who got hit in the head with a can of soda? He was lucky it was a soft drink.", "I was trying to make a pun about escaping quicksand but I'm stuck.", "The rotation of the earth really makes my day!"];
	res.render("404",{"pun":punArray[Math.floor(Math.random()*punArray.length)],"finish":finish});
});

App.get('/signin',(req,res)=>{
	const target = req.query.target; // Finding out where to redirect to after signing in
	res.render("signin",{"target":target});
});

App.get('/blog/new',(req,res)=>{
	res.render("blog_new",{});
	//res.redirect('/signin?target=blog/new');
});
App.post('/blog/new',(req,res)=>{
	console.log("Sanitizing Data...");
	const date = new Date();
	var currentDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()-2000}`;
	var postTitle = req.body.post_title.replace("\'","&apos;").replace("\"","&quot");
	var postBody = req.body.post_body.replace("\'","&apos;").replace("\"","&quot");
	if(postTitle.length < 256 && postTitle.length > 0 && postBody.length < 10000 && postBody.length > 0){
		console.log("Data Sanitization Complete.");
		const client = new pg.Client(process.env.databaseLink+"?ssl=true");
		console.log("Connecting to the database...");
		client.connect((err)=>{
			console.log("Connection success, querying in progress...");
			var query = client.query(
				`INSERT INTO blog(title,date,body)
				VALUES('${postTitle}','${currentDate}','${postBody}');`
			);
			query.on('end',()=>{ // Once the query is complete, the client will close
				client.end();
				console.log("Query complete, Connection terminated.");
			});
		});
		if(req.body.username == process.env.username && req.body.password == process.env.password) // Verifying that the inputed credentials match the admin ones
			res.render("blog_new",{});
		else
			res.redirect('/signin?target=blog/new');
	}else{
		console.log("Error: post_title or post_body exceeded character limit");
		res.render('blog_new',{error:"Error: post_title or post_body exceeded character limit"});
	}
});

App.get('/blog/edit',(req,res)=>{
	//if(req.body.username == process.env.username && req.body.password == process.env.password) // Verifying that the inputed credentials match the admin ones
		var postsArray = [];
		var client = new pg.Client(process.env.databaseLink+"?ssl=true");
		console.log("Connecting to the database...");
		client.connect((err)=>{
			console.log("Connection success, querying in progress...");
			var query = client.query(
				`SELECT * FROM blog`
			);
			query.on('row',(row)=>{
				row.title = row.title.replace("&apos;","\'").replace("&quot","\"");
				row.body = row.body.replace("&apos;","\'").replace("&quot","\"");
				postsArray.push(row);
			});
			query.on('end',()=>{ // Once the query is complete, the client will close
				client.end();
				console.log("Query complete, Connection terminated.");
				res.render("blog_edit",{"postsArray":postsArray});
			});
		});
	//else
		//res.redirect('/signin?target=blog/edit');
});
App.post('/blog/edit',(req,res)=>{
	console.log("Submitted data",req.body.submit, req.body.post_name);
	invalidRequest = false;	
	switch(req.body.submit){
		case 'Edit':
			invalidRequest = true;
			res.redirect('/blog/edit_post?id='+req.body.post_name);
			break;
		case 'Remove':
			const queryString = "DELETE FROM blog WHERE title='"+req.body.post_name+"';";
			break;
		default:
			console.log("Error: Invalid Request");
			invalidRequest = true;
			res.redirect('/blog/edit');
			break;
	}
	if(!invalidRequest){ // Note: This'll probably be removed after we finish the other requests
		var client = new pg.Client(process.env.databaseLink+"?ssl=true");
		console.log("Connecting to the database...");
		client.connect((err)=>{
			console.log("Connection success, querying in progress...");
			var query = client.query(queryString);
			query.on('end',()=>{ // Once the query is complete, the client will close
				client.end();
				console.log("Query complete, Connection terminated.");
				res.redirect('/blog/edit');
			});
		});
	}
});

App.get('/blog/edit_post',(req,res)=>{ // Use the query string to get db data then send it into a form
	console.log(req.query.id);
	var postData;
	const queryString = `SELECT * FROM blog WHERE title='${req.query.id}';`;
	var client = new pg.Client(process.env.databaseLink+"?ssl=true");
	console.log("Connecting to the database...");
	client.connect((err)=>{
		console.log("Connection success, querying in progress...");
		var query = client.query(queryString);
		query.on('row',(row)=>{
			postData = row;
			console.log(postData);
		});
		query.on('end',()=>{ // Once the query is complete, the client will close
			client.end();
			console.log("Query complete, Connection terminated.");
			if(typeof postData == 'undefined'){
				res.redirect('/blog/edit');
			}else{
				res.render('edit_post',{"postData":postData});
			}
		});
	});
});
App.post('/blog/edit_post?*',(req,res)=>{
	var client = new pg.Client(process.env.databaseLink+"?ssl=true");
	console.log("Connecting to the database...");
	client.connect((err)=>{
		console.log("Connection success, querying in progress...");
		var query = client.query(`
			UPDATE blog
			SET title='',body=''
			WHERE title='';
		`);
		query.on('row',(row)=>{
			postData = row;
			console.log(postData);
		});
		query.on('end',()=>{ // Once the query is complete, the client will close
			client.end();
			console.log("Query complete, Connection terminated.");
			if(typeof postData == 'undefined'){
				res.redirect('/blog/edit');
			}else{
				res.render('edit_post',{"postData":postData});
			}
		});
	});
	res.redirect('/blog/edit');
});

// API
App.get('/api',(req,res)=>{
	console.log(req.query.post_title);
	if(typeof req.query.target == 'undefined'){
		res.send('"err":"target not defined! Please see API docs!"');
	}else{
		switch(req.query.target){
			case 'blog': 
				if(typeof req.query.post_title == 'undefined'){
					res.send('"err":"post_title not defined! Please see API docs!"');
				}else{
					var client = new pg.Client(process.env.databaseLink+"?ssl=true");
					console.log("Connecting to the database...");
					client.connect((err)=>{
						console.log("Connection success, querying in progress...");
						var query = client.query(`SELECT * FROM blog WHERE title='${req.query.post_title}';`);
						query.on('row',(row)=>{
							postData = row;
							console.log(postData);
						});
						query.on('end',()=>{ // Once the query is complete, the client will close
							client.end();
							console.log("Query complete, Connection terminated.");
							if(typeof postData == 'undefined'){
								res.send('{"err":"Post does not exist!"}');
							}else{
								res.send(JSON.stringify(postData));
							}
						});
					});
				}
				break;
			default:
				res.send('{"err":"Unknown target! Please see API docs!"');
				break;
		}
	}
});

// If the client's GET request matches none of the availible ones, it'll end up here
App.get('/*',(req,res)=>{
	res.redirect("/404");
});

// Server Launch
App.listen(port,()=>{
	console.log(`App running on ${ip}:${port}`);
});
