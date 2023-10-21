import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';
import { AuthServiceFactory, UserServiceFactory } from '../../auth/auth.factory';
import { FolderServiceFactory } from '../folder/folder.factory';

describe('GET /api/item with caching', () => {
	let userService: UserService;
	let folderService: FolderService;
	let authService: AuthService;

	let user: User;

	beforeAll(async () => {
		userService = UserServiceFactory.make();
		folderService = FolderServiceFactory.make();
		authService = AuthServiceFactory.make();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
	});

	it('Should return status 200 and all items from root folder, even when updated', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
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

		const updatedFolder = await folderService.updateFolder({
			id: folder.id,
			color: '#987654',
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
		});

		const updatedResponse = await global.fastify.inject({
			method: 'GET',
			url: '/api/item',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(updatedResponse.statusCode).toBe(200);
		expect(updatedResponse.json()).toEqual([
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
	});
});