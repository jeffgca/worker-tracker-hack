const tabs = require("tabs");

/**  
 * Tracker constructor, takes an options object that really isn't used...
 */
var tracker = function(options) {
	this._workers = {};
	this.keys = [];
	this._prefix = options.prefix;
	this._instance_key = this._uuid();
}

tracker.prototype.get = function(tab) {
	let ids = this._workers[tab.workers[this._instance_key];
	let _workers = [];
	for (id in ids) {
		if (this.has(id)) {
			_workers.push(this._workers[id]);
		}
	}
	return _workers;
};

tracker.prototype._uuid = function() {
	let uuid = require('api-utils/uuid').uuid().number;
	return uuid.replace(/[\{\}]+/g, '');
}

tracker.prototype.unregister = function(id) {
	// we'll worry about house-cleaning later?
	// ... isn't the magic of weakmaps that this won't be necessary?
	return delete this._workers[id];
}

/**  
 * Register a worker with this instance o the tracker.
 * @param {Worker} worker
 * 
 * For each worker we generate a unique uuid and then add this to a list
 * accessible from a tab object.
 */
tracker.prototype.register = function(worker) {

	// console.log(worker.tab.url);

	/** let's defer clean-up for later.
	worker.on('detach', function(worker) {
		// does this sufficiently clean up?
		worker.tab.workers = null;
	});
	**/

	let _key = this._uuid();
	this._workers[_key] = worker;

	if (typeof(worker.tab.workers) === 'undefined') {
		worker.tab.workers = {};
	}

	if (typeof(worker.tab.workers[this._instance_key]) === 'undefined') {
		worker.tab.workers[this._instance_key] = [];
	}

	worker.tab.workers[this._instance_key].push(_key);
	return _key;
}

/* is there a worker with this id? */
tracker.prototype.has = function(id) {
	return (typeof(this._workers[id] !== 'undefined');
}

/* test function, returns an array of current keys for this instance */
tracker.prototype.dump = function() {
	return Object.keys(this._workers[this._instance_key]);
}

/**  
 * emit *event* to the worker for *tab*
 */
tracker.prototype.emit = function(tab, event, payload) {
	// emit event on each worker on a tab with a given prefix
	if (typeof(tab.workers) === 'undefined' ||
		tab.workers[this._instance_key] === 'undefined') {
		return;
	}

	for (var i = tab.workers[this._instance_key].length - 1; i >= 0; i--) {
		let id = tab.workers[this._instance_key][i];
		let worker = this.get(id);
		worker.port.emit(event, payload);
	};
}

/**  
 * broadcast *event* to all tab workers registered with this instance
 */
tracker.prototype.broadcast = function(event, payload) {
	for (var i = tabs.length - 1; i >= 0; i--) {
		let tab = tabs[i];
		this.emit(tab, event, payload);
	};
}

exports.Tracker = tracker;
