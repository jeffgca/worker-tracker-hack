/**
 * 
 * A big hack on being able to track workers more efficiently.
 */

const data = require("self").data;
const Tracker = require("worker_manager").Tracker;
const tabs = require("tabs");

var L = console.log;

function D(o) {
	L(JSON.stringify(o, null, '   '));
}

var myTracker = new Tracker({
	prefix: 'tracker-test'
});

var test_url = data.url("test.html");

tabs.on("ready", function(tab) {
	console.log('in ready');
	if (tab.url == test_url) {
		let worker = tab.attach({
			contentScriptFile: [data.url('test.js')]
		});
		let uuid = myTracker.register(worker);
		worker.port.on('uuid', function(uuid) {
			L('Got uuid from page: ' + uuid);
		});
		worker.port.emit('init', uuid);
	}
});

let i = 0; while (i < 3) {
	tabs.open(test_url);
	i++;
}

require("widget").Widget({
	id: 'my-tracker-widget',
	label: 'dump workers for this tab',
	contentURL: data.url('favicon.png'),
	onClick: function() {		
		L('in onclick');
		let workers = myTracker.get(tabs.activeTab);
		if (workers) {
			for (var i = workers.length - 1; i >= 0; i--) {
				workers[i].port.emit('fetch-uuid');
			};
		}
			
	}
});

require("widget").Widget({
	id: 'dump-workers',
	label: 'Dump Workers!',
	contentURL: data.url('moz.ico'),
	onClick: function() {
		D(myTracker.dump());
	}
});

require("widget").Widget({
	id: 'emit-all',
	label: 'Emit All',
	contentURL: data.url('moz.ico'),
	onClick: function() {
		myTracker.broadcast('fetch-uuid', true);
	}
});

