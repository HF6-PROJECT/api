import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import ShortcutService from '../shortcut.service';
import FolderService from '../../folder/folder.service';

describe('PUT /api/shortcut', () => {
	let userService: UserService;
	let authService: AuthService;
	let shortcutService: ShortcutService;
	let folderService: FolderService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		shortcutService = new ShortcutService();
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

	it('should return status 200 and shortcut', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const shortcut = await shortcutService.createShortcut({
			name: 'Shortcut Folder',
			ownerId: user.id,
			linkedItemId: folder.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: shortcut.id,
				name: shortcut.name + ' Updated',
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			...shortcut,
			name: shortcut.name + ' Updated',
			createdAt: shortcut.createdAt.toISOString(),
			updatedAt: expect.any(String),
			deletedAt: shortcut.deletedAt?.toISOString() ?? null,
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const shortcut = await shortcutService.createShortcut({
			name: 'Shortcut Folder',
			ownerId: user.id,
			linkedItemId: folder.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/shortcut',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				id: shortcut.id,
				name: shortcut.name + ' Updated',
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

	it('should return status 401, when moving shortcut to a folder without sharing access', async () => {
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

		const shortcut = await shortcutService.createShortcut({
			name: 'Shortcut Folder',
			ownerId: user.id,
			linkedItemId: folder.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: shortcut.id,
				name: 'Shortcut Folder',
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

	it('should return status 401, when shortcut id is not accessible to you', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		const shortcut = await shortcutService.createShortcut({
			name: 'Shortcut Folder',
			ownerId: otherUser.id,
			linkedItemId: folder.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: shortcut.id,
				name: 'Folder Shortcut Updated',
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

	it("should return status 400, when shortcut id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 'invalid_id',
				name: 'updated',
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

	it("should return status 400, when shortcut id isn't given", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'updated',
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

	it("should return status 400, when shortcut with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/shortcut',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 1234,
				name: 'updated',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['Shortcut not found'],
			},
			statusCode: 400,
		});
	});
});
