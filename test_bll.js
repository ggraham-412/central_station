console.log("running test_bll");

// Remove previous test folder
console.log("removing previous test artifacts");
var fs = require('fs');
deleteFolderRecursive = function(path) {
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
deleteFolderRecursive('test');

// Load the business logic component
console.log("loading bll incorrectly - checking for exception");
var business_logic;
try {
	business_logic = require('./bll.js')();
} 
catch (err) {
    console.log("  - caught exception " + err);	
}
console.log("loading bll with methods:");
business_logic = require('./bll.js')('test');
console.log(business_logic);

// Build up a system of apps and keys
console.log("building test artifacts");
business_logic.setItemSync('app1', 'key1', 'val1');
business_logic.setItemSync('app1', 'key2', 'val2');
business_logic.setItemSync('app2', 'key3', 'val3');
business_logic.setItemSync('app2', 'key4', 'val4');
business_logic.setItemSync('app3', 'key5', 'val5');
business_logic.setItemSync('app3', 'key6', 'val6');

console.log("testing list functions");
console.log("  - listAppsSync,  expect ['app1', 'app2', 'app3']: ");
console.log(business_logic.listAppsSync());
console.log("  - listKeysSync('app1'),  expect ['key1', 'key2']: ");
console.log(business_logic.listKeysSync('app1'));
console.log("  - listKeysSync('app2'),  expect ['key3', 'key4']: ");
console.log(business_logic.listKeysSync('app2'));
console.log("  - listKeysSync('app3'),  expect ['key5', 'key6']: ");
console.log(business_logic.listKeysSync('app3'));
console.log("  - listKeysSync('app4'),  expect undefined: ");
console.log(business_logic.listKeysSync('app4'));

console.log("testing get functions");
console.log("  - getItem app1, key1, expect val1")
console.log(business_logic.getItemSync('app1', 'key1'));
console.log("  - getItem app1, key2, expect val2")
console.log(business_logic.getItemSync('app1', 'key2'));
console.log("  - getItem app1, key3, expect undefined")
console.log(business_logic.getItemSync('app1', 'key3'));
console.log("  - getItem app2, key3, expect val3")
console.log(business_logic.getItemSync('app2', 'key3'));
console.log("  - getItem app2, key4, expect val4")
console.log(business_logic.getItemSync('app2', 'key4'));
console.log("  - getItem app2, key5, expect undefined")
console.log(business_logic.getItemSync('app2', 'key5'));
console.log("  - getItem app3, key5, expect val5")
console.log(business_logic.getItemSync('app3', 'key5'));
console.log("  - getItem app3, key6, expect val6")
console.log(business_logic.getItemSync('app3', 'key6'));
console.log("  - getItem app3, key7, expect undefined")
console.log(business_logic.getItemSync('app3', 'key7'));
console.log("  - getItem app4, key1, expect undefined")
console.log(business_logic.getItemSync('app4', 'key7'));
console.log("  - getAllItems app1, expect [{kay: key1, value: val1}, {key: key2, value: val2}]")
console.log(business_logic.getAllItemsSync('app1'));
console.log("  - getAllItems app2, expect [{kay: key3, value: val3}, {key: key4, value: val4}]")
console.log(business_logic.getAllItemsSync('app1'));
console.log("  - getAllItems app3, expect [{kay: key5, value: val5}, {key: key6, value: val6}]")
console.log(business_logic.getAllItemsSync('app1'));
console.log("  - getAllItems app4, expect undefined")
console.log(business_logic.getAllItemsSync('app4'));

console.log("testing update");
business_logic.setItemSync('app1', 'key1', 'vala');
business_logic.setItemSync('app1', 'key2', 'valb');
business_logic.setItemSync('app2', 'key3', 'valc');
business_logic.setItemSync('app2', 'key4', 'vald');
business_logic.setItemSync('app3', 'key5', 'vale');
business_logic.setItemSync('app3', 'key6', 'valf');
console.log("  - getItem app1, key1, expect vala")
console.log(business_logic.getItemSync('app1', 'key1'));
console.log("  - getItem app1, key2, expect valb")
console.log(business_logic.getItemSync('app1', 'key2'));
console.log("  - getItem app2, key3, expect valc")
console.log(business_logic.getItemSync('app2', 'key3'));
console.log("  - getItem app2, key4, expect vald")
console.log(business_logic.getItemSync('app2', 'key4'));
console.log("  - getItem app3, key5, expect vale")
console.log(business_logic.getItemSync('app3', 'key5'));
console.log("  - getItem app3, key6, expect valf")
console.log(business_logic.getItemSync('app3', 'key6'));

console.log("testing add/remove app");
console.log("  - adding app www:");
business_logic.addAppSync("www");
console.log("  - listAppsSync,  expect ['app1', 'app2', 'app3', 'www']: ");
console.log(business_logic.listAppsSync());
console.log("testing items in www");
business_logic.setItemSync('www', 'wkey1', 'vala');
business_logic.setItemSync('www', 'wkey2', 'valb');
console.log("  - getAllItems www, expect [{kay: wkey1, value: vala}, {key: wkey2, value: valb}]")
console.log(business_logic.getAllItemsSync('www'));
console.log("  - listKeysSync('app1'),  expect ['key1', 'key2']: ");
console.log(business_logic.listKeysSync('app1'));
console.log("  - removinging app app1:");
business_logic.removeAppSync("app1");
console.log("  - listAppsSync,  expect ['app2', 'app3', 'www']: ");
console.log(business_logic.listAppsSync());

process.exit();