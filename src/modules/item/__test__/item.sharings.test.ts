import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import FolderService from '../folder/folder.service';
import AuthService from '../../auth/auth.service';
import SharingService from '../sharing/sharing.service';
import { AuthServiceFactory, UserServiceFactory } from '../../auth/auth.factory';
import { FolderServiceFactory } from '../folder/folder.factory';
import { SharingServiceFactory } from '../sharing/sharing.factory';

describe('GET /api/item/:id/sharings', () => {
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

	it("Should return status 200, item, it's sharings, their users and the owner by itemId", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});
		const sharing = await sharingService.createSharing(
			{
				itemId: folder.id,
				userId: otherUser.id,
			},
			user.id,
		);

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder.id}/sharings`,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			name: 'Folder1',
			parentId: null,
			ownerId: user.id.toString(),
			owner: {
				id: user.id,
				name: user.name,
				email: user.email,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			},
			ItemSharing: [
				{
					id: sharing.id,
					userId: sharing.userId,
					user: {
						id: otherUser.id,
						name: otherUser.name,
						email: otherUser.email,
						createdAt: expect.any(String),
						updatedAt: expect.any(String),
					},
					itemId: sharing.itemId,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			],
			mimeType: 'application/vnd.cloudstore.folder',
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
			deletedAt: null,
		});
	});

	it("Should return status 200, item, it's sharings, their users and the owner by itemId", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/1234/sharings`,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['Item not found'],
			},
			statusCode: 400,
		});
	});

	it("Should return status 401, when you don't have access to the item", async () => {
		const { accessToken } = await authService.createTokens(otherUser.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder.id}/sharings`,
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
		const folder = await folderService.createFolder({
			name: 'Folder1',
			color: '#123456',
			ownerId: user.id,
			parentId: null,
		});
		await sharingService.createSharing(
			{
				itemId: folder.id,
				userId: otherUser.id,
			},
			user.id,
		);

		const response = await global.fastify.inject({
			method: 'GET',
			url: `/api/item/${folder.id}/sharings`,
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
