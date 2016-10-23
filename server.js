// BUG: It thinks the tablets screen is too small because of chrome's bloaty url bar
// Middlewares
const http = require('http'),
	fs = require('fs'),
	express = require('express'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	pg = require('pg');

const ip = '192.168.2.9';
var port = process.env.PORT || 8000;
/* // Comment out for dev
const client = new pg.Client(process.env.databaseLink); // Making a new client
client.connect(); // Connecting to the database
const query = client.query( // Making the query
	'CREATE TABLE test()'
);
query.on('end',()=>{client.end();}); // Once the query is complete, the client will close
*/
// App Setup
const App = express();
App.set('views','./views');
App.use(express.static('public'));
App.use(bodyParser.urlencoded({extended:false}));
App.use(bodyParser.json());
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
	var punArray = ["A friend of mine tried to annoy me with bird puns, but I soon realized that toucan play at that game.", "Have you ever tried to eat a clock? It's very time consuming.", "Police were called to a daycare where a three-year-old was resisting a rest.", "I couldn't quite remember how to throw a boomerang, but eventually it came back to me.", "Simba was walking too slow, so I told him to Mufasa.", "Why is Peter Pan always flying? He neverlands! I love this joke because it never grows old.", "Jokes with punch lines can be painfully funny.", "A man died today when a pile of books fell on him. He only had his shelf to blame.", "What do you call a dinosaur with an extensive vocabulary? A Thesaurus.", "What happens when four children lock themselves in a wardrobe? That's narnia business..", "Why was Cinderella thrown off the basketball team? She ran away from the ball.", "My first job was working in an orange juice factory, but I got canned: couldn't concentrate.", "I wanna make a joke about sodium, but Na..", "Did you hear about the Italian chef with a terminal illness? He pastaway.", "An expensive laxative will give you a run for your money.", "I never understood odourless chemicals, they never make scents.", "Never trust an atom, they make up everything!", "When two vegetarians are arguing, is it still considered beef?", "I stayed up all night to see where the sun went. Then it dawned on me.", "When life gives you melons, you're probably dyslexic.", "I make apocalypse jokes like there's no tomorrow.", "No matter how hard you push the envelope it will still be stationery.", "What tea do hockey players drink? Penaltea!", "Did you hear about the guy who got hit in the head with a can of soda? He was lucky it was a soft drink.", "I was trying to make a pun about escaping quicksand but I'm stuck.", "The rotation of the earth really makes my day!"];
	res.render("404",{"pun":punArray[Math.floor(Math.random()*punArray.length)]});
});

App.get('/signin',(req,res)=>{
	const target = req.query.target; // Finding out where to redirect to after signing in
	res.render("signin",{"target":target});
});

App.get('/blog/new',(req,res)=>{
	res.redirect('/signin?target=blog/new');
});
App.post('/blog/new',(req,res)=>{
	if(req.body.username == process.env.username && req.body.password == process.env.password) // Verifying that the inputed credentials match the admin ones
		res.render("blog_new",{});
	else
		res.redirect('/signin');
});

App.get('/blog/edit',(req,res)=>{
	res.redirect('/blog/dev');
});

// If the client's GET request matches none of the availible ones, it'll end up here
App.get('/*',(req,res)=>{
	res.redirect("/404");
});

// Server Launch
App.listen(port,()=>{
	console.log(`App running on ${ip}:${port}`);
});
