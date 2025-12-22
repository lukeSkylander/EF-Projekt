import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import App from "./App";

jest.mock("./api", () => ({
	authAPI: {
		login: jest.fn(),
		register: jest.fn(),
		logout: jest.fn(),
	},
	productsAPI: {
		getAll: jest.fn().mockResolvedValue([]),
	},
	cartAPI: {
		get: jest.fn().mockResolvedValue({ items: [], total: 0, count: 0 }),
		add: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	},
	addressesAPI: {
		create: jest.fn().mockResolvedValue({ id: 1 }),
	},
	ordersAPI: {
		create: jest.fn().mockResolvedValue({}),
	},
	usersAPI: {
		getMe: jest.fn(),
		deleteMe: jest.fn(),
	},
	getToken: jest.fn(() => null),
}));

test("renders brand name", async () => {
	const container = document.createElement("div");
	const root = createRoot(container);

	await act(async () => {
		root.render(<App />);
	});

	expect(container.textContent).toContain("Eclipse Studios");
});
