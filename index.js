var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');

var isWindows = process.platform === 'win32';
var elevatePath = path.join(__dirname, 'bin', 'elevate.cmd');

function execSyncElevated(command) {
	execSync('"' + elevatePath + '" ' + command);
}

module.exports = function takeown (filePath, callback) {

	if (!isWindows) {
		return;
	}

	try {

		var stats = fs.lstatSync(filePath);

		if (stats.isDirectory()) {
			execSyncElevated('takeown /f "' + filePath + '" /r /d y');
		} else {
			execSyncElevated('takeown /f "' + filePath + '"');
		}

		console.log('takeown:', filePath, 'has been seized.');

	} catch (error) {

		if (error.code === 'ENOENT') {
			console.log('takeown:', filePath, 'does not exist.');
		}

		// fs.lstatSync can fail with EPERM on Windows
		if (error.code === 'EPERM') {
			execSyncElevated('takeown /f "' + filePath + '"');
			takeown(filePath, callback);
			return;
		}
	}

	callback();
}
