var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');

var isWindows = process.platform === 'win32';

module.exports = function (directory, callback) {
	if (!isWindows) {
		return;
	}

	execSync('takeown /f "' + directory + '"');

	if (fs.lstatSync(directory).isDirectory()) {
		execSync('takeown /f "' + directory + '" /r /d y');
	}

	console.log('takeown:', directory, 'has been seized.');

	callback();
}
