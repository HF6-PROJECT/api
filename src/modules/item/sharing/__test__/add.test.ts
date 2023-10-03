import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import ItemService from '../../item.service';
import SharingService from '../sharing.service';

describe('POST /api/sharing', () => {
	let userService: UserService;
	let authService: AuthService;
	let itemService: ItemService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		itemService = new ItemService();
		sharingService = new SharingService();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
		otherUser = await userService.createUser({
			name: 'Joe Biden the 2nd',
			email: 'joe2@biden.com',
			password: '4321',
		});
	});

	it('should return status 200 and return a new clientToken', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: user.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: item.id,
				userId: user.id,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			itemId: item.id,
			userId: user.id,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: user.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				itemId: item.id,
				userId: user.id,
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toEqual({
			error: 'UnauthorizedError',
			errors: {
				_: ['Unauthorized'],
			},
			statusCode: 401,
		});
	});

	it('should return status 401, when item not accessible to user', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: item.id,
				userId: user.id,
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toEqual({
			error: 'UnauthorizedError',
			errors: {
				_: ['Unauthorized'],
			},
			statusCode: 401,
		});
	});

	it('should return status 400, when sharing already exists', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		await sharingService.createSharing({
			itemId: item.id,
			userId: user.id,
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				userId: user.id,
				itemId: item.id,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['Sharing already exists'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when user id isn't provided", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: item.id,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['userId is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when user id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: item.id,
				userId: 'invalid_id',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				userId: ['userId must be a number'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when item id isn't provided", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		await itemService.createItem({
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				userId: user.id,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['itemId is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when item id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		await itemService.createItem({
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: 'invalid_id',
				userId: user.id,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				itemId: ['itemId must be a number'],
			},
			statusCode: 400,
		});
	});
});
