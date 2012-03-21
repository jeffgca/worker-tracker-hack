const tabs = require("tabs");

var tracker = function(options) {
	this._workers = {};
	this.keys = [];
	this._prefix = options.prefix;
}

tracker.prototype.get = function(id) {
	return this._workers[id];
};

/* generates a unique, but prefixed key for us. */
tracker.prototype._get_key = function() {
	let uuid = require('api-utils/uuid').uuid().number;
	let _key = '_' + uuid.replace(/[\{\}]+/g, '');
	return this._prefix + _key;
}

tracker.prototype.unregister = function(uuid) {
	// we'll worry about house-cleaning later?
	// ... isn't the magic of weakmaps that this won't be necessary?
}

tracker.prototype.register = function(worker) {

	// console.log(worker.tab.url);

	/** let's defer clean-up for later.
	worker.on('detach', function(worker) {
		// does this sufficiently clean up?
		worker.tab.workers = null;
	});
	**/

	let _key = this._get_key();
	this._workers[_key] = worker;
	this.keys.push(_key);
	if (typeof(worker.tab.workers) === 'undefined') {
		worker.tab.workers = [];
	}
	worker.tab.workers.push(_key);
	return _key;
}

tracker.prototype.has = function(id) {
	return this._collection.has(id);
}

tracker.prototype.dump = function() {
	return Object.keys(this._workers);
}

tracker.prototype.emit = function(tab, prefix, event, payload) {
	// emit event on each worker on a tab with a given prefix
	if (typeof(tab.workers) === 'undefined' || tab.workers.length === 0)
		return;

	for (var i = tab.workers.length - 1; i >= 0; i--) {

		let id = tab.workers[i];

		if (id.indexOf(this._prefix) !== -1) {
			let worker = this.get(id);
			worker.port.emit(event, payload);
		}
	};
}

tracker.prototype.broadcast = function(event, payload) {
	for (var i = tabs.length - 1; i >= 0; i--) {
		let tab = tabs[i];
		console.log(tab);
		this.emit(tab, this._prefix, event, payload);
	};
}

exports.Tracker = tracker;
