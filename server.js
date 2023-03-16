const express = require('express');
var session        = require('express-session');
var passport       = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request        = require('request');
const mariadb = require('mariadb');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Define our constants
const TWITCH_CLIENT_ID = 'jfzv7avfgwhd0oebjb8b2qr3bf6z5i';
const TWITCH_SECRET    = '52k1vpbr4pu09421erk3uwf916w2kk';
const SESSION_SECRET   = '1234567890';
const CALLBACK_URL     = 'https://www.twitch-features.click/auth/twitch/callback';  // You can run locally with - http://localhost:3000/auth/twitch/callback
let results =[];

var corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions))
app.use(express.json());
app.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'josh',
  password: 'josh',
  database: 'fyp'
});

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
  authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
  tokenURL: 'https://id.twitch.tv/oauth2/token',
  clientID: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_SECRET,
  callbackURL: CALLBACK_URL,
  state: true
},
function(accessToken, refreshToken, profile, done) {
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;

  // Securely store user profile in your DB
  //User.findOrCreate(..., function(err, user) {
  //  done(err, user);
  //});

  done(null, profile);
}
));

let just_searched = [];
let pop_seach = [];
let popular = [];
let returnUrl;

app.post("/api", (req, res) => {
  // Get the data from the request body
  const channel = req.headers.channel;
  const user = req.headers.user;
  const timestamp = req.headers.timestamp;
  const searchTerm = req.headers.searchterm;
  const matchWhole = req.headers.matchwhole;
  const searchResults = JSON.stringify(req.body);
  const matchWholeWordValue = matchWhole === 'true' ? 1 : 0;
  // Perform some logic or data processing here, such as querying a database
  async function insertData() {
    let conn;
    try {
      conn = await pool.getConnection();
      var sql = 'INSERT INTO extension_searches (channel, user, timestamp, searchTerm, searchResults, match_whole_word) VALUES (?, ?, ?, ?, ?, ?)';
      const res = await conn.query(sql, [channel, user, timestamp, searchTerm, searchResults, matchWholeWordValue]);
      console.log(res);
    } catch (err) {
      console.log(err);
    } finally {
      if (conn) return conn.end();
    }
  }
  insertData();

  just_searched.push(searchTerm);
  // Increment count for the channel or add new channel to popular array
  if (channel !== undefined) {
    const index = popular.findIndex(({ channel: name }) => name === channel);
    console.log(index)
    if (index === -1) {
      popular.push({ channel: channel, count: 1 });
    } else {
      popular[index].count += 1;
    }
  }
  // Sort the popular array in descending order of count
  popular.sort((a, b) => b.count - a.count);
  // Return a response to the client
  res.json({
    message: "The POST request was processed successfully!",
    data: {
      'Content-Type': 'application/json',
      channel: channel,
      user: user,
      timestamp: timestamp,
      searchTerm: searchTerm,
      searchResults: searchResults,
      matchWhole: matchWhole
    }
  });
  //searchResults.forEach(res=> console.log('message: '+res.message_body, 'commenter: '+res.commenter_display_name, 'video timestamp: '+res.video_offset_link))
});

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', function(req, res) {
  // Read the returnUrl parameter from the query string
  returnUrl = req.query.returnUrl;
  // Redirect the user back to the original URL if returnUrl is present and valid
  passport.authenticate('twitch', { scope: 'user_read' })(req, res);
});

// Set route for OAuth redirect
app.get('/auth/twitch/callback', function(req, res) {
    passport.authenticate('twitch', { failureRedirect: '/', successRedirect: '/'})(req, res);
});

app.get('/', (req, res) => {
  if(returnUrl && returnUrl.startsWith('chrome-extension://')) {
    //const user = req.session.passport.user.data[0].display_name;
    //const extensionId = 'kdilkflgpbfiemlmdgljafkckifnojbl';
    //const url = `chrome-extension://${extensionId}/popup.html?id=${user}`;
    res.send("<script>window.close();</script >")
  }
  if(req.session && req.session.passport && req.session.passport.user) {
    display_name = req.session.passport.user.data[0].display_name;
    access_token = req.session.passport.user.accessToken;
    refresh_token = req.session.passport.user.refreshToken;
    //localStorage.setItem('displayName', display_name);
    res.render('auth', { display_name: display_name, just_searched: just_searched, popular: popular} );
  } else {
    display_name = null;
    res.render('auth', { just_searched, popular} );
  }
});
app.use('/',express.static('public'));

app.get('/submit', (req, res) => {
  res.render('auth', { just_searched, popular} );
});
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/examples', (req, res) => {
  res.render('examples');
});
app.get('/logout', (req, res) => {
  res.clearCookie('connect.sid');
  res.redirect('/');
});
app.post('/submit', (req, res) => {
  const search = req.body.userSearch;
  const searchType = req.body.searchType;
  const wholeWord=req.body.wholeWord;
  results = [];
  // Perform database query or any other necessary processing here
  // and pass the results to the 'results' view as an array of objects
  if(wholeWord){
    if(searchType == "searchTerm"){
      pool.getConnection()
    .then(conn => {
        conn.query('SELECT * FROM extension_searches WHERE searchTerm = ? AND match_whole_word = 1;', [search])
            .then((rows) => {
                //const channels = rows.map(({ channel, count }) => ({ channel, count }));
                results.push(rows);
                conn.end();
                sendResults = results[0];
                if (req.session && req.session.passport && req.session.passport.user) {
                  display_name = req.session.passport.user.data[0].display_name;
                  res.render('results',{ just_searched, display_name, sendResults, search, searchType });
                }else{
                  display_name = null;
                  res.render('results',{ just_searched, sendResults, search, searchType });
                }
            })
            .catch(err => {
                console.log("An error occurred: " + err);
                conn.end();
            });
    })
    .catch(err => {
        console.log("An error occurred: " + err);
    });
    } else if(searchType == "Channel"){
      pool.getConnection()
    .then(conn => {
        conn.query('SELECT * FROM extension_searches WHERE channel = ? AND match_whole_word = 1;', [search])
            .then((rows) => {
                //const channels = rows.map(({ channel, count }) => ({ channel, count }));
                results.push(rows);
                conn.end();
                sendResults = results[0];
                if (req.session && req.session.passport && req.session.passport.user) {
                  display_name = req.session.passport.user.data[0].display_name;
                  res.render('results',{ just_searched, display_name, sendResults, search, searchType });
                }else{
                  display_name = null;
                  res.render('results',{ just_searched, sendResults, search, searchType });
                }
            })
            .catch(err => {
                console.log("An error occurred: " + err);
                conn.end();
            });
    })
    .catch(err => {
        console.log("An error occurred: " + err);
    });
    }else if(searchType == "User"){
      pool.getConnection()
      .then(conn => {
          conn.query('SELECT * FROM extension_searches WHERE user = ? AND match_whole_word = 1;', [search])
              .then((rows) => {
                  //const channels = rows.map(({ channel, count }) => ({ channel, count }));
                  results.push(rows);
                  conn.end();
                  sendResults = results[0];
                  if (req.session && req.session.passport && req.session.passport.user) {
                    display_name = req.session.passport.user.data[0].display_name;
                    res.render('results',{ just_searched, display_name, sendResults, search, searchType });
                  }else{
                    display_name = null;
                    res.render('results',{ just_searched, sendResults, search, searchType });
                  }
              })
              .catch(err => {
                  console.log("An error occurred: " + err);
                  conn.end();
              });
      })
      .catch(err => {
          console.log("An error occurred: " + err);
      });
    }
  }else{
    if(searchType == "searchTerm"){
      pool.getConnection()
    .then(conn => {
        conn.query('SELECT * FROM extension_searches WHERE searchTerm = ?;', [search])
            .then((rows) => {
                //const channels = rows.map(({ channel, count }) => ({ channel, count }));
                results.push(rows);
                conn.end();
                sendResults = results[0];
                if (req.session && req.session.passport && req.session.passport.user) {
                  display_name = req.session.passport.user.data[0].display_name;
                  res.render('results',{ just_searched, display_name, sendResults, search, searchType });
                }else{
                  display_name = null;
                  res.render('results',{ just_searched, sendResults, search, searchType});
                }
            })
            .catch(err => {
                console.log("An error occurred: " + err);
                conn.end();
            });
    })
    .catch(err => {
        console.log("An error occurred: " + err);
    });
    } else if(searchType == "Channel"){
      pool.getConnection()
    .then(conn => {
        conn.query('SELECT * FROM extension_searches WHERE channel = ?;', [search])
            .then((rows) => {
                //const channels = rows.map(({ channel, count }) => ({ channel, count }));
                results.push(rows);
                conn.end();
                sendResults = results[0];
                if (req.session && req.session.passport && req.session.passport.user) {
                  display_name = req.session.passport.user.data[0].display_name;
                  res.render('results',{ just_searched, display_name, sendResults, search, searchType });
                }else{
                  display_name = null;
                  res.render('results',{ just_searched, sendResults, search, searchType });
                }
            })
            .catch(err => {
                console.log("An error occurred: " + err);
                conn.end();
            });
    })
    .catch(err => {
        console.log("An error occurred: " + err);
    });
    }else if(searchType == "User"){
      pool.getConnection()
      .then(conn => {
          conn.query('SELECT * FROM extension_searches WHERE user = ?;', [search])
              .then((rows) => {
                  //const channels = rows.map(({ channel, count }) => ({ channel, count }));
                  results.push(rows);
                  conn.end();
                  sendResults = results[0];
                  if (req.session && req.session.passport && req.session.passport.user) {
                    display_name = req.session.passport.user.data[0].display_name;
                    res.render('results',{ just_searched, display_name, sendResults, search, searchType });
                  }else{
                    display_name = null;
                    res.render('results',{ just_searched, sendResults, search, searchType });
                  }
              })
              .catch(err => {
                  console.log("An error occurred: " + err);
                  conn.end();
              });
      })
      .catch(err => {
          console.log("An error occurred: " + err);
      });
    }
  }

  //results.forEach(res=> console.log('message: '+res.message_body, 'commenter: '+res.commenter_display_name, 'video timestamp: '+res.video_offset_link))
});
app.get('/items/:id', (req, res) => {
  const id = req.params.id;
  item = results[0][id]
  console.log(item)
  if (req.session && req.session.passport && req.session.passport.user) {
    display_name = req.session.passport.user.data[0].display_name;
    res.render('item', { display_name, item });
  }else{
    display_name = null;
    res.render('item', { item });
  }
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
