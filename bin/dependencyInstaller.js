var fs = require('fs'),
	npm = require('npm'),
	path = require('path');
 
var libDir = path.resolve(__dirname,'../lib/'),
	noop = function(){};
 
npm.load(function () {
    fs.readdirSync(libDir).forEach(function (mod) {
        npm.prefix = path.join(libDir, mod);
        npm.commands.install(noop);
    });
});
 