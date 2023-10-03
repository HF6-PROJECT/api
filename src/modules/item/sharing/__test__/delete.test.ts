import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import ItemService from '../../item.service';
import SharingService from '../sharing.service';

describe('DELETE /api/sharing/:id', () => {
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

	it('should return status 204', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: user.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const sharing = await sharingService.createSharing({
			itemId: item.id,
			userId: user.id,
		});

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/sharing/' + sharing.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(204);
		expect(response.body).toEqual('');
		await expect(sharingService.getById(sharing.id)).rejects.toThrow();
	});

	it('should return status 401, when unauthorized', async () => {
		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: user.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const sharing = await sharingService.createSharing({
			itemId: item.id,
			userId: user.id,
		});

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/sharing/' + sharing.id,
			headers: {
				authorization: 'invalid_access_token!!!',
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

	it("should return status 401, when you don't have access", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const item = await itemService.createItem({
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			mimeType: 'text/plain',
		});

		const sharing = await sharingService.createSharing({
			itemId: item.id,
			userId: otherUser.id,
		});

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/sharing/' + sharing.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
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

	it("should return status 400, when sharing id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/sharing/invalid_id',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				id: ['id must be a number'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when sharing with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/sharing/1234',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['Sharing not found'],
			},
			statusCode: 400,
		});
	});
});
