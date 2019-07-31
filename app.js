var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");
var mysql = require('mysql');

const config = require('./config.json');
var sqlCoInfo = config.db_conn;
var baseUrl = config.baseUrl;
var userManagement = require('./routes/userManagement');
var home = require('./routes/home');
var login = require('./routes/login');
var certifications = require ('./routes/certifications');
var employees = require ('./routes/employees');
var super_admin = require('./routes/super_admin');
var megadmin = require('./routes/mega_admin');
//development
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon());
app.use(bodyParser({limit: '50mb'}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
if( !fs.existsSync("./public/img/certifications")){
  fs.mkdirSync("./public/img/certifications");
}
if( !fs.existsSync("./public/img/permis_conduite")){
  fs.mkdirSync("./public/img/permis_conduite");
}
if (!fs.existsSync("./public/img/photo")){
    fs.mkdirSync("./public/img/photo");
}
if (!fs.existsSync("./public/img/piece_identite")){
    fs.mkdirSync("./public/img/piece_identite");
}
if (!fs.existsSync("./public/pdf")){
    fs.mkdirSync("./public/pdf");
}
if (!fs.existsSync("./public/img/signatures")){
    fs.mkdirSync("./public/img/signatures");
}
if (!fs.existsSync("./public/img/passeport")){
    fs.mkdirSync("./public/img/passeport");
}
if (!fs.existsSync("./public/img/visite_medicale")){
    fs.mkdirSync("./public/img/visite_medicale");
}
if (!fs.existsSync("./public/carte")){
    fs.mkdirSync("./public/carte");
}

function createMega(mySqlClient){
  var query = "SELECT COUNT(id_util) AS megadmin FROM utilisateurs WHERE admin = 5";
  mySqlClient.query(query, function (err, count){
    if(err)
    {
      mySqlClient.end();
      console.log(err);
    }
    else
    {
      if(count[0].megadmin == 0){
          query = "INSERT INTO utilisateurs (mail, password, admin, id_entreprise) VALUES ('megadmin@fayat.com', 'A3252F0A036E1EECF4C0FC0775BD57C17C3C8F1D914F1AD6A091009959C05DAB', '5', '1')";
          mySqlClient.query(query, function (err, count){
            if(err)
            {
              mySqlClient.end();
              console.log(err);
            }
            else
            {
              console.log('added')
              query = "INSERT INTO entreprise (ID_entreprise, Nom_entreprise, Lien_web, Adresse, Ville) VALUES ('1', 'Fayat', 'Fayat', 'Fayat_adresse', 'Fayat_ville')";
              mySqlClient.query(query, function (err, count){
                if(err)
                {
                  mySqlClient.end();
                  console.log(err);
                }
                else
                {
                  mySqlClient.end();
                  console.log('added');
                }
              });
            }
          });
      }
      else{
        mySqlClient.end();
      }
    }
  })
}
function sqlCo(mysql, fct){
  var mySqlClient = mysql.createConnection(sqlCoInfo);
  mySqlClient.connect((err) => {
    if(err){
      console.log('Error connecting to Db');
      res.send('error');
    }
    else{
      console.log('Connected to database');
      fct(mySqlClient);
    }
  });
}

sqlCo(mysql, createMega);


app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'jph-cookie',
  secret: 'jph-session',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 53 * 7 * 24 * 60 * 60 * 1000 }
}));

app.use('/', userManagement);
app.use('/', home);
app.use('/', login);
app.use('/', certifications);
app.use('/', employees);
app.use('/', super_admin);
app.use('/', megadmin);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);
/*
app.start = function() {
  // start the web server
  return app.listen(app.get('port'), function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Start at %s', baseUrl);
  });
};*/
app.listen(app.get('port'), function() {
  console.log('run')
})


module.exports = app;
