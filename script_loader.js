function loadScriptsNoCache(paths) {
	if (paths.length == 0) {
		return;
	}

	// Load the first path in the array, shift it, and call loadScriptsNoCache
	// again with the shifted path array when the script loads.
	var fileRef = document.createElement('script');
	fileRef.setAttribute('type', 'text/javascript');
	fileRef.setAttribute('src', paths.shift() + '?ts=' + Date.now());
	fileRef.onload = function() {
		loadScriptsNoCache(paths);
	};

	document.getElementsByTagName('head')[0].appendChild(fileRef);
}


loadScriptsNoCache([
	'../common/jquery-3.1.1.min.js',
	// Make sure cast receiver SDK is loaded before games receiver SDK.
	'//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js',
	'//www.gstatic.com/cast/sdk/libs/games/1.0.0/cast_games_receiver.js',
	'../common/message.js',
	'src/game/config.js',
	'src/engine/core.js',
	'src/game/main.js',
	'receiver.js',
	'startup.js'
]);
