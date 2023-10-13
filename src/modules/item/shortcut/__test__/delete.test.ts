import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import ShortcutService from '../shortcut.service';
import FolderService from '../../folder/folder.service';
import ItemService from '../../item.service';
import { AuthServiceFactory, UserServiceFactory } from '../../../auth/auth.factory';
import { ShortcutServiceFactory } from '../shortcut.factory';
import { FolderServiceFactory } from '../../folder/folder.factory';
import { ItemServiceFactory } from '../../item.factory';

describe('DELETE /api/shortcut/:id', () => {
	let userService: UserService;
	let authService: AuthService;
	let shortcutService: ShortcutService;
	let folderService: FolderService;
	let itemService: ItemService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = AuthServiceFactory.make();
		userService = UserServiceFactory.make();
		shortcutService = ShortcutServiceFactory.make();
		folderService = FolderServiceFactory.make();
		itemService = ItemServiceFactory.make();

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

	it('should delete shortcut AND item', async () => {
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
			method: 'DELETE',
			url: '/api/shortcut/' + shortcut.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(204);
		expect(response.body).toBe('');

		await expect(shortcutService.getByItemId(shortcut.id)).rejects.toThrowError();
		await expect(itemService.getById(shortcut.id)).rejects.toThrowError();
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
			method: 'DELETE',
			url: '/api/shortcut/' + shortcut.id,
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
			method: 'DELETE',
			url: '/api/shortcut/' + shortcut.id,
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

	it("should return status 400, when shortcut id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/shortcut/invalid_id',
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

	it("should return status 400, when shortcut with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/shortcut/1234',
			headers: {
				authorization: 'Bearer ' + accessToken,
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
