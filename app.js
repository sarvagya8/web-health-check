var express = require('express'),
    http = require('http'),
    session = require('express-session'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    morgan = require('morgan'),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('/etc/health_check/config.js'),
    requester = require('./modules/requester.js')();
var app = express();

app.set('port', config.port);
app.set('ip', '0.0.0.0');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('combined'))
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(errorHandler());
app.locals.moment = require('moment');


// Import the models
var models = {
    Checker: require('./models/Checker')(app, mongoose),
    ResponseLog: require('./models/ResponseLog')(app, mongoose)
};

// Init mongodb connection pool
var mongoUrl = 'mongodb://'+config.mongodb.host+':'+config.mongodb.port+'/' + config.mongodb.dbname;
var mongoOptions = {
    server: { poolSize: 5 },
    user: config.mongodb.user,
    pass: config.mongodb.password,
    keepAlive: 1
};

mongoose.connect(mongoUrl, mongoOptions,function(err){
    if (err) {
        throw err
    }else {
        console.log('Connected to ' + mongoUrl);
    }

});

// Load routers
fs.readdirSync('./routers/').forEach(function(file) {
    if ( file[0] == '.' ) return;
    var routerName = file.substr(0, file.indexOf('.'));
    require('./routers/' + routerName)(app, models);
});

// Handle 404
app.use(function (req, res) {
    res.status(404);
    res.render('404', {title: '404: File Not Found'});
});

// Handle 500
app.use(function (error, req, res, next) {
    console.warn(error.message);
    res.status(500);
    res.render('500', {title: '500: Internal Server Error', error: error});
});

var healthCheck = require('./modules/healthChecker.js')(models);

//start requester
requester.start(models, healthCheck.reporter);

http.createServer(app).listen(app.get('port'), app.get('ip'), function () {
    console.log("Express server listening on " + app.get('ip') + ':' + app.get('port'));
});
