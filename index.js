var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');

var IS_WINDOWS = process.platform === 'win32';
var ELEVATE_PATH = path.join(__dirname, 'bin', 'elevate.cmd');

function execSyncElevated (command) {
	execSync('"' + ELEVATE_PATH + '" ' + command);
}

// Intentionally locks up javascript thread for a fixed number of
// recursive calls to give Windows time to get its arse in gear.
function attemptCallback(filePath, callback, attempts) {

	try {

		callback();
		return;

	} catch (error) {

		if (attempts === 0) {
			console.error('takeown: callback failed - exceeded attempts');
			throw error;
		}

		switch (error.code) {

			case 'EPERM':
			case 'EACCES':
			case 'EBUSY':
			case 'ENOTEMPTY':
				return attemptCallback(filePath, callback, --attempts);

			default:
				throw error;
		}
	}
}

// Calls fire and forget Windows specific command to seize control
// of a file or directory. Never seems to fail but we don't get any
// confirmation of success.
function takeOwnership(filePath) {

	try {

		var stats = fs.lstatSync(filePath);

		if (stats.isDirectory()) {
			execSyncElevated('takeown /f "' + filePath + '" /r /d y');
		} else {
			execSyncElevated('takeown /f "' + filePath + '"');
		}

		return;

	} catch (error) {

		if (error.code === 'ENOENT') {
			console.warn('takeown:', filePath, 'does not exist.');
			return;
		}

		// fs.lstatSync can fail with EPERM on Windows so retry
		// after taking control of this specific path.
		if (error.code === 'EPERM') {
			execSyncElevated('takeown /f "' + filePath + '"');
			return takeOwnership(filePath);
		}
	}
}

module.exports = function takeown (filePath, callback, attempts) {

	if (!IS_WINDOWS) {
		callback();
		return;
	}

	try {

		callback();
		return;

	} catch (error) {

		switch (error.code) {

			case 'EPERM':
			case 'EACCES':
			case 'EBUSY':
			case 'ENOTEMPTY':
				takeOwnership(filePath);
				return attemptCallback(filePath, callback, attempts || 3000);

			default:
				throw error;
		}
	}
}
