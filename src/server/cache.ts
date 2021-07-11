import fs from 'fs/promises';
import fsSync from 'fs';

//ensure the data directory exists
try {
	fsSync.statSync('./data');
} catch(e) {
	fsSync.mkdirSync('./data');
}

export const Cache = (cacheName: string) => {
	const cachePath = `./data/${cacheName}.json`;

	let data: Record<string, any> = {};
	try {
		data = JSON.parse(fsSync.readFileSync(cachePath).toString());
	} catch(e){}

	let savePromise = Promise.resolve();
	function save() {
		savePromise = savePromise
			.then(async () => {
				await fs.writeFile(cachePath, JSON.stringify(data, null, 4))
			})
	}

	return new Proxy(data, {
		set(obj, prop, val) {
			data[prop as string] = val;
			save();
			return true;
		}
	});
};

