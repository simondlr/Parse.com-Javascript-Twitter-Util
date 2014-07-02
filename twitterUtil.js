var twitterAPI = require('node-twitter-api');
var request = require('request');
//session needs to be preferably imported from somewhere else.
//TODO: If session not present, throw error.

//replace with hardcoded if desired. This is from environment variables.
var CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var CONSUMER_SECRET = process.env.TWITTER_SECRET;
var CALLBACK = process.env.TWITTER_CALLBACK;

//auth_setup is the initial stage (basically generating the auth url).

var logIn = function(req, onResponse) {
  var twitter = new twitterAPI({
    //set environment variables specific to Twitter application
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    callback: CALLBACK
  });

  if(req.query.oauth_token && req.query.oauth_verifier) { //coming back from successful Twitter log in
    twitter.getAccessToken(req.session.requestToken, req.session.requestTokenSecret, req.query.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
      if (error) {
        onResponse.error("Error with retrieving access tokens: " + error);
      } else {
        //get credentials and store similarly to parse API.
        twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, response){
          if (error) {
            onResponse.error("Couldn't verifiy credentials: " + error);
          } else {
            //javascript sdk doesn't support logging in manually with authData.
            //use REST API instead.
            authData = {
              'twitter': {
                'id': data['id_str'],
                'screen_name': data['screen_name'],
                'consumer_key': CONSUMER_KEY,
                'consumer_secret': CONSUMER_SECRET,
                'auth_token': accessToken,
                'auth_token_secret': accessTokenSecret
              }
            }

            request.post({
              headers: {'X-Parse-Application-Id': process.env.APP_KEY, 'X-Parse-REST-API-Key': process.env.REST_KEY, 'Content-Type': 'application/json'},
              url: 'https://api.parse.com/1/users',
              json: {'authData': authData}
            },
              function (error, response, body) {
                if (error) {
                  onResponse.error("Error authenticating with Parse: " + error);
                } else {
                  onResponse.success(body);
                }
              }
            );
          }
        });
      }
    });
  } else {
    //display sign in forms.
    twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results) {
      if (error) {
        onResponse.error("Error getting OAuth request tokens: " + error);
      } else {
        //store in session
        req.session.requestToken = requestToken
        req.session.requestTokenSecret = requestTokenSecret
        authURL = "https://twitter.com/oauth/authenticate?oauth_token=" + requestToken

        onResponse.auth_setup(authURL);
      } 
    });
  }
}

module.exports.logIn = logIn
