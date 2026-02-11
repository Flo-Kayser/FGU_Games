class ApiClient {
	constructor(baseUrl = '') {
		this.baseUrl = baseUrl;
	}

	_buildUrl(endpoint) {
		if (typeof endpoint === 'string' && /^https?:\/\//i.test(endpoint)) {
			return endpoint;
		}
		if (endpoint instanceof URL) {
			return endpoint.toString();
		}
		return new URL(String(endpoint).replace(/^\//, ''), this.baseUrl).toString();
	}

	async fetchData(endpoint) {
		const response = await fetch(this._buildUrl(endpoint));
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	}
}

export const apiClient = new ApiClient(
	'https://raw.githubusercontent.com/Flo-Kayser/db_futCards/refs/heads/main/db/'
);
