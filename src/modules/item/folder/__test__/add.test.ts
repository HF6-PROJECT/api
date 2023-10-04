import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import FolderService from '../folder.service';

describe('POST /api/folder', () => {
	let userService: UserService;
	let authService: AuthService;
	let folderService: FolderService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		folderService = new FolderService();

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

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Folder Name',
				color: '#78BC61',
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			name: 'Folder Name',
			color: '#78BC61',
			parentId: null,
			ownerId: user.id,
			mimeType: 'application/vnd.cloudstore.folder',
			createdAt: expect.any(String),
			deletedAt: null,
			updatedAt: expect.any(String),
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/folder',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				name: 'Folder Name',
				color: '#78BC61',
				parentId: null,
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

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Folder Name',
				color: '#78BC61',
				parentId: folder.id,
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

	it('should return status 401, when folder name is not provided', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				color: '#78BC61',
				parentId: null,
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

	it('should return status 401, when folder color is not provided', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Folder name',
				parentId: null,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['Color is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when parent id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/folder',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Folder Name',
				color: '#78BC61',
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
