# Chirp

This is a simple [Mean](https://en.wikipedia.org/wiki/MEAN_(software_bundle)) application, which implements some features of twitter.

An [online demo](http://chirp.dimotta.net) is hosted on Heroku.
Read the [release notes](https://github.com/antdimot/chirp/blob/master/Releasenotes.md)
for the last updates.

### Features:
- public timeline *(http://mywebsite/#/public)*
- user timeline   *(http://mywebsite/#/home)*
- user info       *(http://mywebsite/#/info/myusername)*
- post of a message
- list of the followers
- list of the following
- follow an user
- unfollow an user
- sign up
- log on

### Todo (missing features):
- retweet
- response
- searching (users and messages)
- security management (client/server comunication)
- hashtag

### How to install:
1. Clone the project
2. Install **nodejs** and **mongodb**
3. Change diretory to **src**
4. Restore **node_modules** using npm Install
5. Change directory to src/public
6. Restore **bower_components** using bower install
7. Customize the mongodb **connectionstring** in src/util/config.js
8. Customize the url **api** location in src/public/js/config.js
9. Execute **grunt build**
10. Change directory to **build**
11. Execute **node main.js**

### Known issues:
- lack of checks on posts
- bad visualization of long messages
