## Overview
This is a simple webapp for running a personal blog on, built entirely on NodeJS. Currently Express is also integrated with the webapp along with postgres as a database. This was built entirely in my spare time as a hobby project. You can see the project in action here (will be added once the site is completed).

## Cloning/forks
If you'd like to use this project for your _own_ blog, you're entirely welcome to do so. However, I have a few requests in the event that you decide to do so:
- Alter the styles a bit, use different colors so yours has a different look to it than the original.
- Give credit somewhere on the site, preferably in the form of a link back to the repo.
- Do not use it for commercial purposes (such as selling it for profit), in specific, building a similar webapp for a company and just making a clone of this repo would be an example of a commercial purpose.
- Do not claim the code as your own, make it clear that it was based on this project.
- I'd like to be notified if you make your own blog with this code, I'd love to see what my code ends up starting up!

## Setup
Things you'll need:
- A command line capable of running Git and NodeJS
- Git
- NodeJS
- A PostgreSQL database

Setting up the server:

1. Type the following into your command line:
	```
	git clone https://github.com/TylerWalker12/blog.git
	```
while in the desired directory of the files (this will create a folder called 'blog' containing everything in the repo).

2. Type 'npm install' in the 'blog' folder, this will install the various dependencies required by the project.

3. Add environment variables for the following:
	- databaseLink (should be a link to your postgres db)
	- adminUsername (this will be the name you use to login to the app to edit posts)
	- adminPassword (this will be the password you use to login to the app to edit posts)

4. Type 'node server', if all is well, the server should then launch successfully onto localhost:8000 by default (this can be changed by altering the 'address' and 'port' variables).

5. Congrats! Everything should now be working!

## Contributing
If you plan to contribute to the project, I request that you abide by a similar coding style. For instance, use tabs rather than spaces, use the same style of comments, etc. I will also add any and all contributers to the /contributors/ page on the site, along with a link to your own site/accounts.
