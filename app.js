/*
 *   Express application: Central Station App Configuration
 *
 *   Provides REST API and Bootstrap web interface to manage configuration variables
 *   for other web applications.  This uses node-persist as a backend and does not 
 *   require a database.
 *
 *   Greg Graham  12/30.2016
 *
 */

// local data
var name = 'central_station';
var version = '1.0.0';
var port = 8081;  // default is 8081
var data_dir = 'data';

// Process args
var usage = function() {
	console.log("node app [-p port] [-h]");
	process.exit();
}
var parseArgs = function(args) {
	if ( args.length === 0 ) return;
	var i = 0;
	while ( i < args.length ) {
	    switch (args[i]) {
	    case "-d": // data dir
			i++
			if ( i < args.length ) {
			    data_dir = args[i];
			}
			else {
			    usage();
			}
			break;
		case "-p":   // port number
		    i++;
		    if ( i < args.length ) {
		    	port = parseInt(args[i])
		    } else {
		    	usage();
		    }
		    break;
		case "-h":    // help
		    usage();
		    break;
		}
		i++;
	}
}
parseArgs(process.argv.slice(2));

// application components
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var business_logic = require('./bll.js')(data_dir);
var path = require('path');
var cors = require('cors');

// build application
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// create REST API
var router = express.Router();

// About this api
router.get('/about', function(req, res) {
	var info = { info: 'API ' + name + " version " + version };
	res.json(info);
});

// Create a new app
router.put('/add/:app', function(req, res) {
	business_logic.addAppSync(req.params.app);
	res.json( {status: "OK" }); 
});

// List all valid applications
router.get('/list', function(req, res) {
	var info = { applications: business_logic.listAppsSync() };
	res.json(info);
});

// List all keys within given app
router.get('/list/:app', function(req, res) {
	var info = { keys: business_logic.listKeysSync(req.params.app) };
	res.json(info);
});

// Get value of key within given app
// Returns { key: <key> [,value: <value>] } (value is absent if key is undefined)
router.get('/get/:app/:key', function(req, res) {
	var info = { key: req.params.key, value: business_logic.getItemSync(req.params.app, req.params.key) };
	res.json(info);
});

// Get all keys, values in array
router.get('/getall/:app', function(req, res) {
	var info = { values: business_logic.getAllItemsSync(req.params.app) };
	res.json(info);
});

// Set value of key within app. applicatio/json and post body is stringified json.
router.post('/set/:app/:key', function( req, res) {
	var app = req.params.app;
	var key = req.params.key;
	var val = req.body.value;
	business_logic.setItemSync(app, key, val);
	res.json( {status: "OK" }); 
});

// Delete a value
router.delete('/delete/:app/:key', function(req, res)  {
    business_logic.removeItemSync(req.params.app, req.params.key);	
	res.json( {status: "OK" }); 	
});

// Delete an app
router.delete('/delete/:app', function(req, res)  {
    business_logic.removeAppSync(req.params.app);	
	res.json( {status: "OK" }); 	
});

app.use('/api', router);

// Administrative interface
var static_path = 'admin';
app.use(express.static(static_path));

// Start server
app.listen(port);
console.log( 'Server started on port ' + port + ' using data dir ' + data_dir);
