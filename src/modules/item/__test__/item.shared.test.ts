import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';
import BlobService from '../blob/blob.service';
import DocsService from '../docs/docs.service';
import ShortcutService from '../shortcut/shortcut.service';
import SharingService from '../sharing/sharing.service';
import ItemService from '../item.service';

describe('GET /api/item/shared', () => {
	let userService: UserService;
	let folderService: FolderService;
	let authService: AuthService;
	let blobService: BlobService;
	let docsService: DocsService;
	let shortcutService: ShortcutService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		userService = new UserService();
		folderService = new FolderService();
		authService = new AuthService();
		blobService = new BlobService();
		docsService = new DocsService();
		shortcutService = new ShortcutService();
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

	it('Should return status 200 and all items from parentId', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: otherUser.id,
			parentId: null,
		});
		await sharingService.createSharing(
			{
				itemId: folder1.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: otherUser.id,
			parentId: folder1.id,
			blobUrl: 'https://example.com/test1.txt',
		});
		await sharingService.createSharing(
			{
				itemId: blob.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			color: '#987654',
			ownerId: otherUser.id,
			parentId: folder1.id,
		});
		await sharingService.createSharing(
			{
				itemId: folder2.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const docs = await docsService.createDocs({
			name: 'Docs1',
			text: 'Docs1 text',
			ownerId: otherUser.id,
			parentId: folder1.id,
		});
		await sharingService.createSharing(
			{
				itemId: docs.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const shortcut = await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: otherUser.id,
			linkedItemId: blob.id,
			parentId: folder1.id,
		});
		await sharingService.createSharing(
			{
				itemId: shortcut.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/shared',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		console.log(response.json());

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([
			{
				id: expect.any(Number),
				name: 'Folder1',
				color: '#123456',
				parentId: null,
				ownerId: otherUser.id,
				isStarred: false,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: expect.any(Number),
				name: 'Folder2',
				color: '#987654',
				parentId: folder1.id,
				ownerId: otherUser.id,
				isStarred: false,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: expect.any(Number),
				name: 'Shortcut',
				parentId: folder1.id,
				ownerId: otherUser.id,
				isStarred: false,
				mimeType: 'application/vnd.cloudstore.shortcut',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: expect.any(Number),
				name: 'Docs1',
				text: 'Docs1 text',
				parentId: folder1.id,
				ownerId: otherUser.id,
				isStarred: false,
				mimeType: 'application/vnd.cloudstore.docs',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: expect.any(Number),
				name: 'test1.txt',
				blobUrl: 'https://example.com/test1.txt',
				parentId: folder1.id,
				ownerId: otherUser.id,
				isStarred: false,
				mimeType: 'text/plain',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
		]);
	});

	it('Should return status 401, when unauthorized', async () => {
		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: otherUser.id,
			parentId: null,
		});
		await sharingService.createSharing(
			{
				itemId: folder1.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: otherUser.id,
			parentId: folder1.id,
			blobUrl: 'https://example.com/test1.txt',
		});
		await sharingService.createSharing(
			{
				itemId: blob.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			color: '#987654',
			ownerId: otherUser.id,
			parentId: folder1.id,
		});
		await sharingService.createSharing(
			{
				itemId: folder2.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const docs = await docsService.createDocs({
			name: 'Docs1',
			text: 'Docs1 text',
			ownerId: otherUser.id,
			parentId: folder1.id,
		});
		await sharingService.createSharing(
			{
				itemId: docs.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const shortcut = await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: otherUser.id,
			linkedItemId: blob.id,
			parentId: folder1.id,
		});
		await sharingService.createSharing(
			{
				itemId: shortcut.id,
				userId: user.id,
			},
			otherUser.id,
		);

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/shared',
			headers: {
				authorization: 'invalid_token!!',
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
