import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import FolderService from '../../folder/folder.service';
import { AuthServiceFactory, UserServiceFactory } from '../../../auth/auth.factory';
import { FolderServiceFactory } from '../../folder/folder.factory';

describe('POST /api/shortcut', () => {
	let userService: UserService;
	let authService: AuthService;
	let folderService: FolderService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = AuthServiceFactory.make();
		userService = UserServiceFactory.make();
		folderService = FolderServiceFactory.make();

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
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Shortcut Folder',
				linkedItemId: folder.id,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			name: 'Shortcut Folder',
			linkedItemId: folder.id,
			parentId: null,
			ownerId: user.id,
			mimeType: 'application/vnd.cloudstore.shortcut',
			createdAt: expect.any(String),
			deletedAt: null,
			updatedAt: expect.any(String),
		});
	});

	it('should return status 200 and item, when adding a shortcut twice', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Shortcut Folder',
				linkedItemId: folder.id,
			},
		});

		const response2 = await global.fastify.inject({
			method: 'POST',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Shortcut Folder2',
				linkedItemId: folder.id,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			name: 'Shortcut Folder',
			parentId: null,
			ownerId: user.id,
			linkedItemId: folder.id,
			mimeType: 'application/vnd.cloudstore.shortcut',
			createdAt: expect.any(String),
			deletedAt: null,
			updatedAt: expect.any(String),
		});
		expect(response2.json()).toEqual({
			id: expect.any(Number),
			name: 'Shortcut Folder2',
			parentId: null,
			ownerId: user.id,
			linkedItemId: folder.id,
			mimeType: 'application/vnd.cloudstore.shortcut',
			createdAt: expect.any(String),
			deletedAt: null,
			updatedAt: expect.any(String),
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
			url: '/api/shortcut',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				name: 'Shortcut Folder',
				linkedItemId: folder.id,
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

	it('should return status 401, when parent id is provided, but no access to parent', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const parentFolder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Shortcut Folder',
				linkedItemId: folder.id,
				parentId: parentFolder.id,
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

	it('should return status 401, when shortcut name is not provided', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				linkedItemId: folder.id,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['Name is required'],
			},
			statusCode: 400,
		});
	});

	it('should return status 401, when shortcut linkedItemId is not provided', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Shortcut Folder',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['Linked itemId is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when parent id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Folder Name',
				linkedItemId: folder.id,
				parentId: 'invalid_id',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				parentId: ['Parent id must be a number'],
			},
			statusCode: 400,
		});
	});
});
