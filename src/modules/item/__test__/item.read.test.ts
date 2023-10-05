import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';

// The tests can only be run with folder - Since the blob service has istanbul ignore next
describe('GET /api/item/:parentId', () => {
	let userService: UserService;
	let folderService: FolderService;
	let authService: AuthService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		userService = new UserService();
		folderService = new FolderService();
		authService = new AuthService();

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

	it('All items should from the folder, with the given parentId', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const parentFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
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

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([
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
		]);
	});

	it('Getting items should return error, if auth is not set', async () => {
		const parentFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
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

	it('Getting items should return error, if you do not have access to the parent folder', async () => {
		const { accessToken } = await authService.createTokens(otherUser.id);
		const parentFolder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
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
