const fs = require('fs'),
	{promisify} = require('util'),
	writeFile = promisify(fs.writeFile);

//ensure the data directory exists
try {
	fs.statSync('./data');
} catch(e) {
	fs.mkdirSync('./data');
}

module.exports = (cacheName) => {
	const cachePath = `./data/${cacheName}.json`;

	let data = {};
	try {
		data = JSON.parse(fs.readFileSync(cachePath).toString());
	} catch(e){}

	let savePromise = Promise.resolve();
	function save() {
		savePromise = savePromise
			.then(async () => {
				await writeFile(cachePath, JSON.stringify(data, null, 4))
			})
	}
	return new Proxy(data, {
		set(obj, prop, val) {
			data[prop] = val;
			save();
			return true;
		}
	});
};

