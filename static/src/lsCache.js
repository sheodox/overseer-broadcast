//proxy based caching in localStorage, used as a plain JS object
export default (cacheName) => {
	const cacheKey = `lscache-${cacheName}`,
		getCachedObject = () => JSON.parse(localStorage.getItem(cacheKey)) || {};

	return new Proxy({}, {
		get: (obj, prop) => {
			return getCachedObject()[prop];
		},
		set: (obj,  prop, value) => {
			const existing = getCachedObject();
			existing[prop] = value;
			localStorage.setItem(cacheKey, JSON.stringify(existing));
			return true;
		}
	})
}