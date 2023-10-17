import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';
import SharingService from '../sharing/sharing.service';
import { AuthServiceFactory, UserServiceFactory } from '../../auth/auth.factory';
import { FolderServiceFactory } from '../folder/folder.factory';
import { SharingServiceFactory } from '../sharing/sharing.factory';

describe('GET /api/item/:id/breadcrumb', () => {
	let userService: UserService;
	let folderService: FolderService;
	let authService: AuthService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		userService = UserServiceFactory.make();
		folderService = FolderServiceFactory.make();
		authService = AuthServiceFactory.make();
		sharingService = SharingServiceFactory.make();

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

	it('Should return status 200 and itemPath, when has access to all', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			color: '#123456',
			ownerId: user.id,
			parentId: folder1.id,
		});

		const folder3 = await folderService.createFolder({
			name: 'Folder3',
			color: '#123456',
			ownerId: user.id,
			parentId: folder2.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder3.id}/breadcrumb`,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: folder3.id,
			name: folder3.name,
			parent: {
				id: folder2.id,
				name: folder2.name,
				parent: {
					id: folder1.id,
					name: folder1.name,
					parent: null,
				},
			},
		});
	});

	it('Should return status 200 and itemPath, when has access to everything but one', async () => {
		const { accessToken } = await authService.createTokens(otherUser.id);

		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			color: '#123456',
			ownerId: user.id,
			parentId: folder1.id,
		});
		await sharingService.createSharing({ itemId: folder2.id, userId: otherUser.id }, user.id);

		const folder3 = await folderService.createFolder({
			name: 'Folder3',
			color: '#123456',
			ownerId: user.id,
			parentId: folder2.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder3.id}/breadcrumb`,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: folder3.id,
			name: folder3.name,
			parent: {
				id: folder2.id,
				name: folder2.name,
				parent: undefined,
			},
		});
	});

	it("Should return status 200 and itemPath, when has access to everything but doesn't own root", async () => {
		const { accessToken } = await authService.createTokens(otherUser.id);

		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});
		await sharingService.createSharing({ itemId: folder1.id, userId: otherUser.id }, user.id);

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			color: '#123456',
			ownerId: user.id,
			parentId: folder1.id,
		});

		const folder3 = await folderService.createFolder({
			name: 'Folder3',
			color: '#123456',
			ownerId: user.id,
			parentId: folder2.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder3.id}/breadcrumb`,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: folder3.id,
			name: folder3.name,
			parent: {
				id: folder2.id,
				name: folder2.name,
				parent: {
					id: folder1.id,
					name: folder1.name,
					parent: undefined,
				},
			},
		});
	});

	it("Should return status 401, when you don't have access to the item", async () => {
		const { accessToken } = await authService.createTokens(otherUser.id);

		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			color: '#123456',
			ownerId: user.id,
			parentId: folder1.id,
		});

		const folder3 = await folderService.createFolder({
			name: 'Folder3',
			color: '#123456',
			ownerId: user.id,
			parentId: folder2.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder3.id}/breadcrumb`,
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

	it('Should return status 401, when unauthorized', async () => {
		const folder1 = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const folder2 = await folderService.createFolder({
			name: 'Folder2',
			color: '#123456',
			ownerId: user.id,
			parentId: folder1.id,
		});

		const folder3 = await folderService.createFolder({
			name: 'Folder3',
			color: '#123456',
			ownerId: user.id,
			parentId: folder2.id,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder3.id}/breadcrumb`,
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
