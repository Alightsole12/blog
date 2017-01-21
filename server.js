// BUG: It thinks the tablets screen is too small because of chrome's bloaty url bar
// TODO: Work on the /blog page
// Maybe an "add image" button on /new and /edit? would open small input field where you enter the url and then it inserts an <a> tag into the field
// Middlewares
const http = require('http'),
	fs = require('fs'),
	express = require('express'),
	bodyParser = require('body-parser'),
	helmet = require('helmet'),
	ejs = require('ejs'),
	pg = require('pg');

// SET ENV VARIABLES
const address = 'localhost';
var port = process.env.PORT || 8000;
var debug = process.env.debug || true;
function ascii2html(ascii){
	// Returns html-safe code from ascii
	return ascii.replace(/\'/g,"&apos;").replace(/\"/g,"&quot;").replace(/\`/g,"&#96;");
}
function html2ascii(html){
	// Returns ascii from html-safe code
	return html.replace(/&#96;/g,"\`").replace(/&quot;/g,"\"").replace(/&apos;/g,"\'");
}
function convertLinkFormat(str){
	str = html2ascii(str);
	var validCharacter;
	var tempStr = str.toLowerCase().split("");
	var allowedCharacters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','-','_'];
	for(var i = 0; i <= tempStr.length; i++){
		// For every character in the string
		validCharacter = false;
		for(var j = 0; j <= allowedCharacters.length; j++){
			// Comparing it against every character in the allowedCharacters array
			if(tempStr[i] == " ") tempStr[i] = "-";
			if(tempStr[i] == allowedCharacters[j]) validCharacter = true;
		}
		if(!validCharacter) tempStr[i] = "";
	}
	var alteredStr = "";
	for(var i = 0; i <= tempStr.length; i++){
		if(tempStr[i] != null) alteredStr += tempStr[i];
	}
	return alteredStr;
}
if(typeof debug == 'string')
	debug = false;
const finish = typeof debug;

// App Setup
const App = express();
App.set('views','./views');
App.use(express.static('public'));
App.use(bodyParser.urlencoded({extended:false}));
App.use(bodyParser.json());
App.use(helmet());
App.set('view engine','ejs');

// Routing
// The landing page
App.get('/',(req,res)=>{
	res.send("Hello world! <a href='/blog'>Blog</a>");
});

// The main blog page
App.get('/blog',(req,res)=>{
	const client = new pg.Client(process.env.databaseLink+"?ssl=true");
	var data = [];
	client.connect((err)=>{
		console.log("Connection success, querying in progress...");
		var query = client.query(
			`SELECT * FROM blog ORDER BY date;`
		);
		query.on('row',(row)=>{
			console.log("Row recieved:",JSON.stringify(row));
			row.body = row.body.slice(0,400);
			const tempDate = row.date.toString().split(" ");
			row.date = `${tempDate[1]} ${tempDate[2]}, ${tempDate[3]}`;
			data.push(row);
		});
		query.on('end',()=>{ // Once the query is complete, the client will close
			client.end();
			console.log("Query complete, Connection terminated.");
			res.render('blog',{data});
		});
	});
});

App.get('/blog/post/',(req,res)=>{
	res.redirect('/blog');
});

// A specific blog post
App.get('/blog/post/*',(req,res)=>{
	// Grab the title from the url and then use it to grab db data and send it to ejs, else redirect
	var data;
	const urlData = req.url.split("/"); // Picking apart the URL data to see which post is being requested
	const client = new pg.Client(process.env.databaseLink+"?ssl=true");
	console.log(urlData);
	console.log("Connecting to the database...");
	client.connect((err)=>{
		console.log("Connection success, querying in progress...");
		var query = client.query(
			`SELECT * FROM blog WHERE post_link='${urlData[3]}';`
		); // Checking if it exists in the database, converting ascii to html safe characters like in the records
		query.on('row',(row)=>{
			console.log("Row recieved.");
			data = JSON.stringify(row);
		});
		query.on('end',()=>{ // Once the query is complete, the client will close
			client.end();
			console.log(data);
			console.log("Query complete, Connection terminated.");
			if(data == null) res.redirect("/404");
			else res.render("post",JSON.parse(data)); // Sending data to the view
		});
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
	// Implement below later for security
	//res.redirect('/signin?target=blog/new');
});
App.post('/blog/new',(req,res)=>{
	console.log("Sanitizing Data...");
	const date = new Date();
	var currentDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()-2000}`;
	var postTitle = ascii2html(req.body.post_title);
	var postBody = ascii2html(req.body.post_body);
	var postLink = convertLinkFormat(postTitle);
	if(postTitle.length < 256 && postTitle.length > 0 && postBody.length < 10000 && postBody.length > 0){
		console.log("Data Sanitization Complete.");
		const client = new pg.Client(process.env.databaseLink+"?ssl=true");
		console.log("Connecting to the database...");
		client.connect((err)=>{
			console.log("Connection success, querying in progress...");
			var query = client.query(
				`INSERT INTO blog(title,date,body,post_link)
				VALUES('${postTitle}','${currentDate}','${postBody}','${postLink}');`
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
				`SELECT * FROM blog ORDER BY date`
			);
			query.on('row',(row)=>{
				row.title = ascii2html(row.title);
				row.body = ascii2html(row.body);
				postsArray.push(row);
			});
			query.on('end',()=>{ // Once the query is complete, the client will close
				client.end();
				console.log("Query complete, Connection terminated.");
				res.render("blog_edit",{"postsArray":postsArray});
			});
		});
	//else
		// Implement below for security
		//res.redirect('/signin?target=blog/edit');
});
App.post('/blog/edit',(req,res)=>{
	console.log("Submitted data",req.body.submit, req.body.post_name);
	invalidRequest = false;
	req.body.post_link = convertLinkFormat(req.body.post_name);
	switch(req.body.submit){
		case 'Edit':
			res.redirect('/blog/edit_post?post_link='+req.body.post_link);
			break;
		case 'View':
			res.redirect('/blog/post/'+req.body.post_link);
			break;
		case 'Remove':
			var client = new pg.Client(process.env.databaseLink+"?ssl=true");
			console.log("Connecting to the database...");
			client.connect((err)=>{
				console.log("Connection success, querying in progress...");
				var query = client.query("DELETE FROM blog WHERE title='"+req.body.post_name+"';");
				query.on('end',()=>{ // Once the query is complete, the client will close
					client.end();
					console.log("Query complete, Connection terminated.");
					res.redirect('/blog/edit');
				});
			});
			break;
		default:
			console.log("Error: Invalid Request");
			invalidRequest = true;
			res.redirect('/blog/edit');
			break;
	}
});

App.get('/blog/edit_post',(req,res)=>{ // Use the query string to get db data then send it into a form
	console.log(req.query.id);
	if(req.query.post_link != null){ // Ensuring the query variable exists in the request
		console.log("req.query.post_link: ",req.query.post_link);
		var postData;
		const queryString = `SELECT * FROM blog WHERE post_link='${req.query.post_link}';`;
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
					console.log("Database has no records for such post!");
					res.redirect('/blog/edit');
				}else{
					res.render('edit_post',{"postData":postData});
				}
			});
		});
	}else{
		res.redirect('/blog/edit');
	}
});
App.post('/blog/edit_post?*',(req,res)=>{
	var client = new pg.Client(process.env.databaseLink+"?ssl=true");
	console.log("Connecting to the database...");
	client.connect((err)=>{
		console.log("Connection success, querying in progress...");
		// Updating the title and body to the data sent
		var query = client.query(`
			UPDATE blog
			SET title='${ascii2html(req.body.post_title)}',body='${ascii2html(req.body.post_body)}'
			WHERE title='${req.query.old_title}';
		`);
		query.on('end',()=>{ // Once the query is complete, the client will close
			client.end();
			console.log("Query complete, Connection terminated.");
			console.log(typeof postData == 'undefined');
		});
	});
	res.redirect('/blog/edit');
});

// API
App.get('/api',(req,res)=>{
	var postData;
	console.log("API call in progress...");
	console.log(req.query.post_link);
	if(typeof req.query.target == 'undefined'){
		res.send('{"err":"target not defined! Please see API docs!"}');
	}else{
		switch(req.query.target){
			case 'blog':
				if(typeof req.query.post_link == 'undefined'){
					res.send('{"err":"post_link not defined! Please see API docs!"}');
				}else{
					var client = new pg.Client(process.env.databaseLink+"?ssl=true");
					console.log("Connecting to the database...");
					client.connect((err)=>{
						console.log("Connection success, querying in progress...");
						var query = client.query(`SELECT * FROM blog WHERE post_link='${req.query.post_link}';`);
						query.on('row',(row)=>{
							postData = row;
							console.log(row);
						});
						query.on('end',()=>{ // Once the query is complete, the client will close
							client.end();
							console.log("Query complete, Connection terminated.");
							if(typeof postData == 'undefined'){
								res.send('{"err":"Post does not exist!"}');
							}else{
								// Solution: Decode the html-safe characters on the client-side
								res.send(JSON.stringify(postData));
							}
						});
					});
				}
				break;
			default:
				res.send('{"err":"Unknown target! Please see API docs!"}');
				break;
		}
	}
	console.log("API call complete");
});

// If the client's GET request matches none of the availible ones, it'll end up here
App.get('/*',(req,res)=>{
	res.redirect("/404");
});

// Server Launch
App.listen(port,address,()=>{
	console.log(`App running on ${address}:${port}`);
});
