import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';

// The tests can only be run with folder - Since the blob service has istanbul ignore next
describe('GET /api/item', () => {
	let userService: UserService;
	let folderService: FolderService;
	let authService: AuthService;

	let user: User;

	beforeAll(async () => {
		userService = new UserService();
		folderService = new FolderService();
		authService = new AuthService();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
	});

	it('All items should be returned from the users root "folder"', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		await folderService.createFolder({
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
				name: 'Folder1',
				color: '#123456',
				parentId: null,
				ownerId: user.id,
				mimeType: 'application/vnd.cloudstore.folder',
				createdAt: expect.any(String),
				deletedAt: null,
				updatedAt: expect.any(String),
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
			},
		]);
	});

	it('Getting root items should return error, if auth is not set', async () => {
		await folderService.createFolder({
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
