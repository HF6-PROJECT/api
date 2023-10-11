import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import AuthService from '../../auth/auth.service';
import StarredService from '../starred/starred.service';
import FolderService from '../folder/folder.service';
import BlobService from '../blob/blob.service';
import SharingService from '../sharing/sharing.service';
import ItemService from '../item.service';

describe('GET /api/item/starred', () => {
	let userService: UserService;
	let authService: AuthService;
	let starredService: StarredService;
	let folderService: FolderService;
	let blobService: BlobService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		starredService = new StarredService();
		folderService = new FolderService();
		blobService = new BlobService();
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

	it('should return status 400, when item starred browse is empty', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toStrictEqual([]);
	});

	it('should return status 200 and items', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			ownerId: user.id,
			parentId: null,
			color: '#79BC61',
		});

		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: null,
			blobUrl: 'https://example.com/test1.txt',
		});

		const blob2 = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test2.txt',
			ownerId: otherUser.id,
			parentId: null,
			blobUrl: 'https://example.com/test2.txt',
		});

		await starredService.createStarred({
			itemId: folder1.id,
			userId: user.id,
		});

		await starredService.createStarred({
			itemId: folder2.id,
			userId: user.id,
		});

		await starredService.createStarred({
			itemId: blob.id,
			userId: user.id,
		});

		await sharingService.createSharing(
			{
				itemId: blob2.id,
				userId: user.id,
			},
			otherUser.id,
		);

		await starredService.createStarred({
			itemId: blob2.id,
			userId: user.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/item/starred',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([
			{
				id: folder1.id,
				name: 'Folder1',
				color: '#78BC61',
				parentId: null,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: blob2.id,
				name: 'test2.txt',
				blobUrl: 'https://example.com/test2.txt',
				parentId: null,
				ownerId: otherUser.id,
				mimeType: 'text/plain',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: folder2.id,
				name: 'Folder2',
				color: '#79BC61',
				parentId: null,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
			{
				id: blob.id,
				name: 'test1.txt',
				blobUrl: 'https://example.com/test1.txt',
				parentId: null,
				ownerId: user.id,
				mimeType: 'text/plain',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
			},
		]);
	});

	it('should return status 401, when unauthorized', async () => {
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
			method: 'GET',
			url: '/api/item/starred',
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
});
