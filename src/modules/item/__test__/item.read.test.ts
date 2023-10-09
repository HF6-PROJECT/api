import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';
import BlobService from '../blob/blob.service';
import DocsService from '../docs/docs.service';
import ShortcutService from '../shortcut/shortcut.service';

describe('GET /api/item/:parentId', () => {
	let userService: UserService;
	let folderService: FolderService;
	let authService: AuthService;
	let blobService: BlobService;
	let docsService: DocsService;
	let shortcutService: ShortcutService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		userService = new UserService();
		folderService = new FolderService();
		authService = new AuthService();
		blobService = new BlobService();
		docsService = new DocsService();
		shortcutService = new ShortcutService();

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

	it('Should return status 200 and all items from parentId', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const parentFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: parentFolder.id,
			blobUrl: 'https://example.com/test1.txt',
		});

		await folderService.createFolder({
			name: 'Folder2',
			color: '#987654',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		await docsService.createDocs({
			name: 'Docs1',
			text: 'Docs1 text',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: user.id,
			linkedItemId: blob.id,
			parentId: parentFolder.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
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
				parentId: parentFolder.id,
				ownerId: user.id,
				mimeType: 'text/plain',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: expect.any(Number),
				name: 'Folder2',
				color: '#987654',
				parentId: parentFolder.id,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: expect.any(Number),
				name: 'Docs1',
				text: 'Docs1 text',
				parentId: parentFolder.id,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.docs',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: expect.any(Number),
				name: 'Shortcut',
				parentId: parentFolder.id,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.shortcut',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
		]);
	});

	it('Should return status 401, when unauthorized', async () => {
		const parentFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: parentFolder.id,
			blobUrl: 'https://example.com/test1.txt',
		});
		await folderService.createFolder({
			name: 'Folder2',
			color: '#987654',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: user.id,
			linkedItemId: blob.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
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

	it('Should return status 401, when unauthorized to the parent folder', async () => {
		const { accessToken } = await authService.createTokens(otherUser.id);
		const parentFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});
		await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: parentFolder.id,
			blobUrl: 'https://example.com/test1.txt',
		});
		await folderService.createFolder({
			name: 'Folder2',
			color: '#987654',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
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
});
