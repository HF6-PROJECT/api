import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';
import BlobService from '../blob/blob.service';
import DocsService from '../docs/docs.service';
import ShortcutService from '../shortcut/shortcut.service';
import { AuthServiceFactory, UserServiceFactory } from '../../auth/auth.factory';
import { FolderServiceFactory } from '../folder/folder.factory';
import { BlobServiceFactory } from '../blob/blob.factory';
import { DocsServiceFactory } from '../docs/docs.factory';
import { ShortcutServiceFactory } from '../shortcut/shortcut.factory';

describe('GET /api/item', () => {
	let userService: UserService;
	let folderService: FolderService;
	let authService: AuthService;
	let blobService: BlobService;
	let docsService: DocsService;
	let shortcutService: ShortcutService;

	let user: User;

	beforeAll(async () => {
		userService = UserServiceFactory.make();
		folderService = FolderServiceFactory.make();
		authService = AuthServiceFactory.make();
		blobService = BlobServiceFactory.make();
		docsService = DocsServiceFactory.make();
		shortcutService = ShortcutServiceFactory.make();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
	});

	it('Should return status 200 and all items from root folder', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: null,
			blobUrl: 'https://example.com/test1.txt',
		});

		const folder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});
		await folderService.createFolder({
			name: 'Folder2',
			color: '#987654',
			ownerId: user.id,
			parentId: null,
		});

		await docsService.createDocs({
			name: 'Docs1',
			text: 'Docs1 text',
			ownerId: user.id,
			parentId: null,
		});

		await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: user.id,
			linkedItemId: folder.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([
			{
				id: expect.any(Number),
				name: 'test1.txt',
				blobUrl: 'https://example.com/test1.txt',
				parentId: null,
				ownerId: user.id,
				mimeType: 'text/plain',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: expect.any(Number),
				name: 'Folder1',
				color: '#123456',
				parentId: null,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: expect.any(Number),
				name: 'Folder2',
				color: '#987654',
				parentId: null,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: expect.any(Number),
				name: 'Docs1',
				text: 'Docs1 text',
				parentId: null,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.docs',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: expect.any(Number),
				name: 'Shortcut',
				parentId: null,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.shortcut',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
				linkedItemId: folder.id,
			},
		]);
	});

	it('Should return status 401, when unauthorized', async () => {
		await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: null,
			blobUrl: 'https://example.com/test1.txt',
		});

		const folder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});
		await folderService.createFolder({
			name: 'Folder2',
			color: '#987654',
			ownerId: user.id,
			parentId: null,
		});

		await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: user.id,
			linkedItemId: folder.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'WrongAuth!',
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
});
