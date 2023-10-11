import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import FolderService from '../../folder/folder.service';
import StarredService from '../../starred/starred.service';
import SharingService from '../../sharing/sharing.service';
import ItemService from '../../item.service';

describe('POST /api/starred', () => {
	let userService: UserService;
	let authService: AuthService;
	let folderService: FolderService;
	let starredService: StarredService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		folderService = new FolderService();
		starredService = new StarredService();
		sharingService = new SharingService(new ItemService());

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

	it('should return status 200 and item', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: folder.id,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			userId: user.id,
			itemId: folder.id,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it('should return status 200 and item, when starred', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		await sharingService.createSharing(
			{
				itemId: folder.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: folder.id,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			itemId: folder.id,
			userId: user.id,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it('should return status 400, when starring an item twice', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		await starredService.createStarred({
			itemId: folder.id,
			userId: user.id,
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: folder.id,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['Starred already exists'],
			},
			statusCode: 400,
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/starred',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				itemId: folder.id,
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

	it('should return status 401, when item id is provided, but no access to item', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: folder.id,
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

	it('should return status 401, when itemid is not provided', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {},
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

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				itemId: 'id',
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
