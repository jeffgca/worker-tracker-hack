
var uuid;

self.port.on('init', function(_uuid) {
	console.log("got uuid: "+_uuid);
	uuid = _uuid;
});

self.port.on('fetch-uuid', function() {
	self.port.emit('uuid', uuid);
});


