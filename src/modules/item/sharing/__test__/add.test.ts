import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import ItemService from '../../item.service';
import SharingService from '../sharing.service';
import FolderService from '../../folder/folder.service';

describe('POST /api/sharing', () => {
	let userService: UserService;
	let authService: AuthService;
	let itemService: ItemService;
	let folderService: FolderService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		itemService = new ItemService();
		folderService = new FolderService();
		sharingService = new SharingService(itemService);

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

	it('should return status 200 and return the created sharing', async () => {
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
				email: user.email,
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

	it('should return status 200, return the created sharing and recursively create sharings on all child items', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'root',
			ownerId: user.id,
			parentId: null,
			color: 'red',
		});

		const item1 = await itemService.createItem({
			name: 'test1.txt',
			ownerId: user.id,
			parentId: folder.id,
			mimeType: 'text/plain',
		});

		const item2 = await itemService.createItem({
			name: 'test2.txt',
			ownerId: user.id,
			parentId: folder.id,
			mimeType: 'text/plain',
		});

		const subFolder = await folderService.createFolder({
			name: 'sub',
			ownerId: user.id,
			parentId: folder.id,
			color: 'red',
		});

		const item3 = await itemService.createItem({
			name: 'test3.txt',
			ownerId: user.id,
			parentId: subFolder.id,
			mimeType: 'text/plain',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: folder.id,
				email: otherUser.email,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			itemId: folder.id,
			userId: otherUser.id,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
		await expect(
			sharingService.getByItemIdAndUserId(folder.id, otherUser.id),
		).resolves.toBeDefined();
		await expect(
			sharingService.getByItemIdAndUserId(item1.id, otherUser.id),
		).resolves.toBeDefined();
		await expect(
			sharingService.getByItemIdAndUserId(item2.id, otherUser.id),
		).resolves.toBeDefined();
		await expect(
			sharingService.getByItemIdAndUserId(subFolder.id, otherUser.id),
		).resolves.toBeDefined();
		await expect(
			sharingService.getByItemIdAndUserId(item3.id, otherUser.id),
		).resolves.toBeDefined();
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
				email: user.email,
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
				email: user.email,
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

	it("should return status 400, when user with email doesn't exist", async () => {
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
				email: 'user@whodoesnotexist.com',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['User not found'],
			},
			statusCode: 400,
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

		await sharingService.createSharing(
			{
				itemId: item.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/sharing',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				email: user.email,
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

	it("should return status 400, when email isn't provided", async () => {
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
				_: ['Email is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when email isn't a valid email", async () => {
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
				email: 'invalid_email',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				email: ['Email must be of correct format'],
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
				email: user.email,
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
				email: user.email,
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
