/*
 *   Business Logic Layer module for Consfiguartion Station
 *
 *   Uses node_persist to store configuration parameters by application
 *   in folders labeled by application name.  Since node_persist is a 
 *   singleton, we switch to the appropriate folder at the start of each
 *   operation.
 * 
 *   Greg Graham  12/29/2016
 */

// a pragma to disable jshint warnings from node globals.
/* jshint node: true */

"use strict";

 // Components
var fs = require('fs');
var path = require('path');
var storage = require('node-persist');

// Other Local data
var data_dir = '';
var last_app = '';

// Initialize the module
function init(dir) {
    if ( !dir ) throw 'bll init: no data directory given';
    data_dir = path.join('.',dir);
    last_app = '';
    if ( ! fs.existsSync(data_dir) ) {
        fs.mkdirSync(data_dir);
    }
}

// getters for module data
function getDataDir() {
    return data_dir;
}
function getLastApp() {
    return last_app;
}

// deletes a folder recursively like 'rm -r'
var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

// API Sync methods

// This method ensures that the underlying node-persist implementation 
// is pointed at the correct app.  Returns true if successful.
function ensureAppSync(app, createFlag) {
    if ( app === '' ) return false;
    if ( app === last_app ) return true;
    var dir = path.join(data_dir, app);
    if ( ! fs.existsSync(dir) && createFlag ) {
    	fs.mkdirSync(dir);
    } 
    if ( fs.existsSync(dir) ) {
        storage.initSync({
    	    dir: dir,
    	    ttl: false
        });
        last_app = app;
        return true;
    } else {
        last_app = '';
        return false;
    }
}

// This adds a new app
function addAppSync(app) {
    if ( app === '' ) return;
    var dir = path.join(data_dir, app);
    if ( ! fs.existsSync(dir) ) {
        fs.mkdirSync(dir);
    } 
}

// This removes an app
function removeAppSync(app) {
    if ( app === '' ) return;
    var dir = path.join(data_dir, app);
    if ( fs.existsSync(dir) ) {
        deleteFolderRecursive(dir);
    } 
}

// This sets a value for key in app
function setItemSync(app, key, value) {
	if ( ensureAppSync(app, true) ) {
	    storage.setItemSync(key, value);
    }
}

// This gets a value for key in app, or undefined
function getItemSync(app, key) {
    if ( ensureAppSync(app) ) {
        return storage.getItemSync(key);
    }
}

// Removes key from app
function removeItemSync(app, key) {
    if ( ensureAppSync(app) ) {
        storage.removeItemSync(key);
    }
}

// Returns all keys and values in array of JSON, or undefined
function getAllItemsSync(app) {
    if ( ensureAppSync(app) ) {
        var retval = [];
        storage.forEach(function(key, value) {
            retval.push({key: key, value: value});
        });
        return retval;
    }
}

// Returns list of keys in app or undefined if app doesn't exist
function listKeysSync(app) {
    if ( ensureAppSync(app) ) {
        return storage.keys();
    }    
}

// returns a list of apps
function listAppsSync() {
    return fs.readdirSync(data_dir);
}

// Export methods 
module.exports = function(dir) {
    init(dir);
    return {
      getDataDir: getDataDir,
      getLastApp: getLastApp,
      addAppSync: addAppSync,
      removeAppSync: removeAppSync,
	  setItemSync: setItemSync, 
      getItemSync: getItemSync,
      getAllItemsSync: getAllItemsSync,
      removeItemSync: removeItemSync,
      listKeysSync: listKeysSync,
      listAppsSync: listAppsSync};
};
