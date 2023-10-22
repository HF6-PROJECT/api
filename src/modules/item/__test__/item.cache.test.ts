import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';
import BlobService from '../blob/blob.service';
import DocsService from '../docs/docs.service';
import ShortcutService from '../shortcut/shortcut.service';
import SharingService from '../sharing/sharing.service';
import { AuthServiceFactory, UserServiceFactory } from '../../auth/auth.factory';
import { FolderServiceFactory } from '../folder/folder.factory';
import { BlobServiceFactory } from '../blob/blob.factory';
import { DocsServiceFactory } from '../docs/docs.factory';
import { ShortcutServiceFactory } from '../shortcut/shortcut.factory';
import { SharingServiceFactory } from '../sharing/sharing.factory';
import { Folder } from '../folder/folder.schema';

describe('GET /api/item with caching', () => {
	let userService: UserService;
	let authService: AuthService;
	let folderService: FolderService;
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

	it('Should return status 200 and all items from root folder, even when created, updated and deleted', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		/**
		 *
		 * Empty
		 *
		 */
		const emptyResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(emptyResponse.statusCode).toBe(200);
		expect(emptyResponse.json()).toEqual([]);

		/**
		 *
		 * Folder
		 *
		 */
		const createdFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const createdFolderResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdFolderResponse.statusCode).toBe(200);
		expect(createdFolderResponse.json()).toEqual([
			{
				id: createdFolder.id,
				name: createdFolder.name,
				color: createdFolder.color,
				parentId: createdFolder.parentId,
				ownerId: createdFolder.ownerId,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedFolder = await folderService.updateFolder({
			id: createdFolder.id,
			color: '#987654',
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
		});

		const updatedFolderResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedFolderResponse.statusCode).toBe(200);
		expect(updatedFolderResponse.json()).toEqual([
			{
				id: updatedFolder.id,
				name: updatedFolder.name,
				color: updatedFolder.color,
				parentId: updatedFolder.parentId,
				ownerId: updatedFolder.ownerId,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await folderService.deleteFolderByItemId(createdFolder.id);

		const deletedFolderResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedFolderResponse.statusCode).toBe(200);
		expect(deletedFolderResponse.json()).toEqual([]);

		/**
		 *
		 * Blob
		 *
		 */
		const createdBlob = await blobService.createBlob({
			name: 'test1.txt',
			blobUrl: 'https://example.com/test1.txt',
			mimeType: 'text/plain',
			ownerId: user.id,
			parentId: null,
		});

		const createdBlobResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdBlobResponse.statusCode).toBe(200);
		expect(createdBlobResponse.json()).toEqual([
			{
				id: createdBlob.id,
				name: createdBlob.name,
				blobUrl: createdBlob.blobUrl,
				parentId: createdBlob.parentId,
				ownerId: createdBlob.ownerId,
				mimeType: createdBlob.mimeType,
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedBlob = await blobService.updateBlob({
			id: createdBlob.id,
			name: 'test2.txt',
			blobUrl: 'https://example.com/test2.txt',
			mimeType: 'text/plain',
			ownerId: user.id,
			parentId: null,
		});

		const updatedBlobResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedBlobResponse.statusCode).toBe(200);
		expect(updatedBlobResponse.json()).toEqual([
			{
				id: updatedBlob.id,
				name: updatedBlob.name,
				blobUrl: updatedBlob.blobUrl,
				parentId: updatedBlob.parentId,
				ownerId: updatedBlob.ownerId,
				mimeType: updatedBlob.mimeType,
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await blobService.deleteBlobByItemId(createdBlob.id);

		const deletedBlobResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedBlobResponse.statusCode).toBe(200);
		expect(deletedBlobResponse.json()).toEqual([]);

		/**
		 *
		 * Docs
		 *
		 */
		const createdDocs = await docsService.createDocs({
			name: 'Docs1',
			text: 'Docs1 text',
			ownerId: user.id,
			parentId: null,
		});

		const createdDocsResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdDocsResponse.statusCode).toBe(200);
		expect(createdDocsResponse.json()).toEqual([
			{
				id: createdDocs.id,
				name: createdDocs.name,
				text: createdDocs.text,
				parentId: createdDocs.parentId,
				ownerId: createdDocs.ownerId,
				mimeType: 'application/vnd.cloudstore.docs',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedDocs = await docsService.updateDocs({
			id: createdDocs.id,
			name: 'Docs2',
			text: 'Docs2 text',
			ownerId: user.id,
			parentId: null,
		});

		const updatedDocsResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedDocsResponse.statusCode).toBe(200);
		expect(updatedDocsResponse.json()).toEqual([
			{
				id: updatedDocs.id,
				name: updatedDocs.name,
				text: updatedDocs.text,
				parentId: updatedDocs.parentId,
				ownerId: updatedDocs.ownerId,
				mimeType: 'application/vnd.cloudstore.docs',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await docsService.deleteDocsByItemId(createdDocs.id);

		const deletedDocsResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedDocsResponse.statusCode).toBe(200);
		expect(deletedDocsResponse.json()).toEqual([]);

		/**
		 *
		 * Shortcut
		 *
		 */
		const linkedFolder = await folderService.createFolder({
			name: 'Linked Folder',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		// Set cache to make sure that shortcut invalidates cache on created.
		await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		const createdShortcut = await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: user.id,
			linkedItemId: linkedFolder.id,
			parentId: null,
		});

		const createdShortcutResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdShortcutResponse.statusCode).toBe(200);
		expect(createdShortcutResponse.json()).toEqual([
			{
				id: linkedFolder.id,
				name: linkedFolder.name,
				parentId: linkedFolder.parentId,
				ownerId: linkedFolder.ownerId,
				color: linkedFolder.color,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: createdShortcut.id,
				name: createdShortcut.name,
				parentId: createdShortcut.parentId,
				ownerId: createdShortcut.ownerId,
				linkedItemId: createdShortcut.linkedItemId,
				mimeType: 'application/vnd.cloudstore.shortcut',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedShortcut = await shortcutService.updateShortcut({
			id: createdShortcut.id,
			name: 'Shortcut2',
			ownerId: user.id,
			linkedItemId: linkedFolder.id,
			parentId: null,
		});

		const updatedShortcutResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedShortcutResponse.statusCode).toBe(200);
		expect(updatedShortcutResponse.json()).toEqual([
			{
				id: linkedFolder.id,
				name: linkedFolder.name,
				parentId: linkedFolder.parentId,
				ownerId: linkedFolder.ownerId,
				color: linkedFolder.color,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: updatedShortcut.id,
				name: updatedShortcut.name,
				parentId: updatedShortcut.parentId,
				ownerId: updatedShortcut.ownerId,
				linkedItemId: updatedShortcut.linkedItemId,
				mimeType: 'application/vnd.cloudstore.shortcut',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await shortcutService.deleteShortcutByItemId(createdShortcut.id);

		const deletedShortcutResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedShortcutResponse.statusCode).toBe(200);
		expect(deletedShortcutResponse.json()).toEqual([
			{
				id: linkedFolder.id,
				name: linkedFolder.name,
				parentId: linkedFolder.parentId,
				ownerId: linkedFolder.ownerId,
				color: linkedFolder.color,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);
	});
});

describe('GET /api/item/:parentId with caching', () => {
	let userService: UserService;
	let authService: AuthService;
	let folderService: FolderService;
	let blobService: BlobService;
	let docsService: DocsService;
	let shortcutService: ShortcutService;

	let sharingService: SharingService;

	let user: User;
	let parentFolder: Folder;
	let accessToken: string;

	beforeAll(async () => {
		userService = UserServiceFactory.make();
		folderService = FolderServiceFactory.make();
		authService = AuthServiceFactory.make();
		blobService = BlobServiceFactory.make();
		docsService = DocsServiceFactory.make();
		shortcutService = ShortcutServiceFactory.make();

		sharingService = SharingServiceFactory.make();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe45435346354@biden.com',
			password: '1234',
		});

		parentFolder = await folderService.createFolder({
			name: 'Test Folder',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		accessToken = (await authService.createTokens(user.id)).accessToken;
	});

	it('Should return status 200 and all items from folder, even when created, updated and deleted', async () => {
		/**
		 *
		 * Empty
		 *
		 */
		const emptyResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(emptyResponse.statusCode).toBe(200);
		expect(emptyResponse.json()).toEqual([]);

		/**
		 *
		 * Folder
		 *
		 */
		const createdFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const createdFolderResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdFolderResponse.statusCode).toBe(200);
		expect(createdFolderResponse.json()).toEqual([
			{
				id: createdFolder.id,
				name: createdFolder.name,
				color: createdFolder.color,
				parentId: createdFolder.parentId,
				ownerId: createdFolder.ownerId,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedFolder = await folderService.updateFolder({
			id: createdFolder.id,
			color: '#987654',
			name: 'Folder1',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const updatedFolderResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedFolderResponse.statusCode).toBe(200);
		expect(updatedFolderResponse.json()).toEqual([
			{
				id: updatedFolder.id,
				name: updatedFolder.name,
				color: updatedFolder.color,
				parentId: updatedFolder.parentId,
				ownerId: updatedFolder.ownerId,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await folderService.deleteFolderByItemId(createdFolder.id);

		const deletedFolderResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedFolderResponse.statusCode).toBe(200);
		expect(deletedFolderResponse.json()).toEqual([]);

		/**
		 *
		 * Blob
		 *
		 */
		const createdBlob = await blobService.createBlob({
			name: 'test1.txt',
			blobUrl: 'https://example.com/test1.txt',
			mimeType: 'text/plain',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const createdBlobResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdBlobResponse.statusCode).toBe(200);
		expect(createdBlobResponse.json()).toEqual([
			{
				id: createdBlob.id,
				name: createdBlob.name,
				blobUrl: createdBlob.blobUrl,
				parentId: createdBlob.parentId,
				ownerId: createdBlob.ownerId,
				mimeType: createdBlob.mimeType,
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedBlob = await blobService.updateBlob({
			id: createdBlob.id,
			name: 'test2.txt',
			blobUrl: 'https://example.com/test2.txt',
			mimeType: 'text/plain',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const updatedBlobResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedBlobResponse.statusCode).toBe(200);
		expect(updatedBlobResponse.json()).toEqual([
			{
				id: updatedBlob.id,
				name: updatedBlob.name,
				blobUrl: updatedBlob.blobUrl,
				parentId: updatedBlob.parentId,
				ownerId: updatedBlob.ownerId,
				mimeType: updatedBlob.mimeType,
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await blobService.deleteBlobByItemId(createdBlob.id);

		const deletedBlobResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedBlobResponse.statusCode).toBe(200);
		expect(deletedBlobResponse.json()).toEqual([]);

		/**
		 *
		 * Docs
		 *
		 */
		const createdDocs = await docsService.createDocs({
			name: 'Docs1',
			text: 'Docs1 text',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const createdDocsResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdDocsResponse.statusCode).toBe(200);
		expect(createdDocsResponse.json()).toEqual([
			{
				id: createdDocs.id,
				name: createdDocs.name,
				text: createdDocs.text,
				parentId: createdDocs.parentId,
				ownerId: createdDocs.ownerId,
				mimeType: 'application/vnd.cloudstore.docs',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedDocs = await docsService.updateDocs({
			id: createdDocs.id,
			name: 'Docs2',
			text: 'Docs2 text',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const updatedDocsResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedDocsResponse.statusCode).toBe(200);
		expect(updatedDocsResponse.json()).toEqual([
			{
				id: updatedDocs.id,
				name: updatedDocs.name,
				text: updatedDocs.text,
				parentId: updatedDocs.parentId,
				ownerId: updatedDocs.ownerId,
				mimeType: 'application/vnd.cloudstore.docs',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await docsService.deleteDocsByItemId(createdDocs.id);

		const deletedDocsResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedDocsResponse.statusCode).toBe(200);
		expect(deletedDocsResponse.json()).toEqual([]);

		/**
		 *
		 * Shortcut
		 *
		 */
		const linkedFolder = await folderService.createFolder({
			name: 'Linked Folder',
			color: '#123456',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		// Set cache to make sure that shortcut invalidates cache on created.
		await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		const createdShortcut = await shortcutService.createShortcut({
			name: 'Shortcut',
			ownerId: user.id,
			linkedItemId: linkedFolder.id,
			parentId: parentFolder.id,
		});

		const createdShortcutResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(createdShortcutResponse.statusCode).toBe(200);
		expect(createdShortcutResponse.json()).toEqual([
			{
				id: linkedFolder.id,
				name: linkedFolder.name,
				parentId: linkedFolder.parentId,
				ownerId: linkedFolder.ownerId,
				color: linkedFolder.color,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: createdShortcut.id,
				name: createdShortcut.name,
				parentId: createdShortcut.parentId,
				ownerId: createdShortcut.ownerId,
				linkedItemId: createdShortcut.linkedItemId,
				mimeType: 'application/vnd.cloudstore.shortcut',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		const updatedShortcut = await shortcutService.updateShortcut({
			id: createdShortcut.id,
			name: 'Shortcut2',
			ownerId: user.id,
			linkedItemId: linkedFolder.id,
			parentId: parentFolder.id,
		});

		const updatedShortcutResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedShortcutResponse.statusCode).toBe(200);
		expect(updatedShortcutResponse.json()).toEqual([
			{
				id: linkedFolder.id,
				name: linkedFolder.name,
				parentId: linkedFolder.parentId,
				ownerId: linkedFolder.ownerId,
				color: linkedFolder.color,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: updatedShortcut.id,
				name: updatedShortcut.name,
				parentId: updatedShortcut.parentId,
				ownerId: updatedShortcut.ownerId,
				linkedItemId: updatedShortcut.linkedItemId,
				mimeType: 'application/vnd.cloudstore.shortcut',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await shortcutService.deleteShortcutByItemId(createdShortcut.id);

		const deletedShortcutResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(deletedShortcutResponse.statusCode).toBe(200);
		expect(deletedShortcutResponse.json()).toEqual([
			{
				id: linkedFolder.id,
				name: linkedFolder.name,
				parentId: linkedFolder.parentId,
				ownerId: linkedFolder.ownerId,
				color: linkedFolder.color,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		await folderService.deleteFolderByItemId(linkedFolder.id);
	});

	it('Should clear cache when shared', async () => {
		const folder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const otherUser = await userService.createUser({
			name: 'Joe Biden the 2nd',
			email: 'share@with.me',
			password: '1234',
		});

		const otherAccessToken = (await authService.createTokens(otherUser.id)).accessToken;

		// Hasn't been shared
		const emptyResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + otherAccessToken,
			},
		});

		expect(emptyResponse.statusCode).toBe(401);

		// Share folder
		await sharingService.createSharing(
			{
				itemId: parentFolder.id,
				userId: otherUser.id,
			},
			user.id,
		);

		const sharedResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + otherAccessToken,
			},
		});

		expect(sharedResponse.statusCode).toBe(200);
		expect(sharedResponse.json()).toEqual([
			{
				id: folder.id,
				name: folder.name,
				color: folder.color,
				parentId: folder.parentId,
				ownerId: folder.ownerId,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);

		// Add folder to shared folder
		const anotherFolderInShared = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: parentFolder.id,
		});

		const sharedAnotherResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/' + parentFolder.id,
			headers: {
				authorization: 'Bearer ' + otherAccessToken,
			},
		});

		expect(sharedAnotherResponse.statusCode).toBe(200);
		expect(sharedAnotherResponse.json()).toEqual([
			{
				id: folder.id,
				name: folder.name,
				color: folder.color,
				parentId: folder.parentId,
				ownerId: folder.ownerId,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
			{
				id: anotherFolderInShared.id,
				name: anotherFolderInShared.name,
				color: anotherFolderInShared.color,
				parentId: anotherFolderInShared.parentId,
				ownerId: anotherFolderInShared.ownerId,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
				isStarred: false,
			},
		]);
	});
});
