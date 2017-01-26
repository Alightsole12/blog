## Setup
Things you'll need:

- A command line capable of running Git and NodeJS
- Git
- NodeJS
- A PostgreSQL database

Setting up the server:

1. Type 
```
git clone https://github.com/TylerWalker12/blog.git
```
in the desired directory of the files (this will create a folder called 'blog' containing everything in the repo).
2. Type 'npm install' in the 'blog' folder, this will install the various dependencies required by the project.
3. Add environment variables for the following: 

- databaseLink (should be a link to your postgres db)
- adminUsername (this will be the name you use to login to the app to edit posts)
- adminPassword (this will be the password you use to login to the app to edit posts)

4. Type 'node server', if all is well, the server should then launch successfully onto localhost:8000 by default (this can be changed by altering the 'address' and 'port' variables).
5. Congrats! Everything should now be working!
