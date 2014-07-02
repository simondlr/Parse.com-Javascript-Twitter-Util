##Parse.com Twitter Util for Node.js.

A utility function to easily log into parse.com through Twitter.

Parse.com has a Facebook utility function to log into Parse, but not Twitter.
This is a short, small utility function that follows similar conventions.

##Usage

Example use case: using express, express-session and request. 

'''
var express = require('express');
var session = require('express-session')
var parse = require('parse').Parse;

var app_key = process.env.APP_KEY;
var js_key = process.env.JS_KEY;

var app = express();
app.use(session({secret: 'insertyourownsecrethere'}));
parse.initialize(app_key, js_key);

var User = parse.Object.extend('User');
var userQuery = new parse.Query(User);
var twitterUtil = require('./twitterUtil');

app.get('/', function(req, res) {
  currentUser = parse.User.current();
  if (parse.User.current() == null) {
    //no user is signed in
    twitterUtil.logIn(req, {
      auth_setup: function(authURL) {
        //present log in page/modal.
        console.log(authURL);
      },
      success: function(user) {
        console.log(user);
      },
      error: function(error) {
        console.log("Error logging in.\n" + error);
      }
    });
  }
});
'''

##Conventions

Might not follow style conventions to the tee. If there is something that can be changed, please submit a pull request!

##Licence

MIT Licence.
