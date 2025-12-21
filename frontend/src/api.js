import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

export const setToken = (token) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');

export { getToken };

export const authAPI = {
	register: async (name, email, password) => {
		const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
		if (res.data.token) setToken(res.data.token);
		return res.data;
	},

	login: async (email, password) => {
		const res = await axios.post(`${API_URL}/auth/login`, { email, password });
		if (res.data.token) setToken(res.data.token);
		return res.data;
	},

	logout: () => {
		removeToken();
	},
};

export const usersAPI = {
	getMe: async () => {
		const res = await axios.get(`${API_URL}/users/me`, {
			headers: { Authorization: `Bearer ${getToken()}` },
		});
		return res.data;
	},
};

export const productsAPI = {
	getAll: async (category = '') => {
		const url = category ? `${API_URL}/products?category=${category}` : `${API_URL}/products`;
		const res = await axios.get(url);
		return res.data;
	},
};

export const cartAPI = {
	get: async () => {
		const res = await axios.get(`${API_URL}/cart`, {
			headers: { Authorization: `Bearer ${getToken()}` },
		});
		return res.data;
	},

	add: async (product_id, quantity = 1) => {
		const res = await axios.post(
			`${API_URL}/cart`,
			{ product_id, quantity },
			{ headers: { Authorization: `Bearer ${getToken()}` } }
		);
		return res.data;
	},

	update: async (cartItemId, quantity) => {
		const res = await axios.put(
			`${API_URL}/cart/${cartItemId}`,
			{ quantity },
			{ headers: { Authorization: `Bearer ${getToken()}` } }
		);
		return res.data;
	},

	remove: async (cartItemId) => {
		const res = await axios.delete(`${API_URL}/cart/${cartItemId}`, {
			headers: { Authorization: `Bearer ${getToken()}` },
		});
		return res.data;
	},
};

export const addressesAPI = {
	create: async (address) => {
		const res = await axios.post(`${API_URL}/addresses`, address, {
			headers: { Authorization: `Bearer ${getToken()}` },
		});
		return res.data;
	},
};

export const ordersAPI = {
	create: async (address_id) => {
		const res = await axios.post(
			`${API_URL}/orders`,
			{ address_id },
			{ headers: { Authorization: `Bearer ${getToken()}` } }
		);
		return res.data;
	},
};
