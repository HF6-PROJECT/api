import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import FolderService from '../folder.service';
import { AuthServiceFactory, UserServiceFactory } from '../../../auth/auth.factory';
import { FolderServiceFactory } from '../folder.factory';

describe('PUT /api/folder', () => {
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

	it('should return status 200 and folder', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: folder.id,
				name: folder.name + ' updated',
				color: '#79BC61',
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			...folder,
			name: folder.name + ' updated',
			color: '#79BC61',
			createdAt: folder.createdAt.toISOString(),
			updatedAt: expect.any(String),
			deletedAt: folder.deletedAt?.toISOString() ?? null,
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
			method: 'PUT',
			url: '/api/folder',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				id: folder.id,
				name: folder.name + ' updated',
				color: '#79BC61',
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

	it('should return status 401, when moving folder to a folder without sharing access', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const parentFolder = await folderService.createFolder({
			name: 'Parent',
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
			method: 'PUT',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: folder.id,
				name: 'Folder1',
				color: '#78BC61',
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

	it('should return status 401, when folder id is not accessible to you', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: folder.id,
				name: folder.name + ' updated',
				color: '#79BC61',
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

	it("should return status 400, when folder id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 'invalid_id',
				name: 'updated',
				color: '#79BC61',
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

	it("should return status 400, when folder id isn't given", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'updated',
				color: '#79BC61',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['id is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 404, when folder with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 1234,
				name: 'updated',
				color: '#79BC61',
			},
		});

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			error: 'NotFoundError',
			errors: {
				_: ['Folder not found'],
			},
			statusCode: 404,
		});
	});
});
