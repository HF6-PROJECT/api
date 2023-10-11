import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import StarredService from '../starred.service';
import FolderService from '../../folder/folder.service';
import SharingService from '../../sharing/sharing.service';
import ItemService from '../../item.service';

describe('DELETE /api/starred/:id', () => {
	let userService: UserService;
	let authService: AuthService;
	let starredService: StarredService;
	let folderService: FolderService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		starredService = new StarredService();
		folderService = new FolderService();
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

	it('should delete starred', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const starred = await starredService.createStarred({
			itemId: folder.id,
			userId: user.id,
		});

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/starred/' + starred.itemId,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(204);
		expect(response.body).toBe('');

		await expect(starredService.getByItemIdAndUserId(folder.id, user.id)).rejects.toThrowError();
	});

	it('should return status 401, when unauthorized', async () => {
		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: user.id,
			parentId: null,
			color: '#78BC61',
		});

		const starred = await starredService.createStarred({
			itemId: folder.id,
			userId: user.id,
		});

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/starred/' + starred.itemId,
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

	it('should return status 400, since starred id is not accessible to others', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		const starred = await starredService.createStarred({
			itemId: folder.id,
			userId: otherUser.id,
		});

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/starred/' + starred.itemId,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['Starred not found'],
			},
			statusCode: 400,
		});
	});

	it('should return status 200, when removing a starring, to an item you no longer have access to', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const folder = await folderService.createFolder({
			name: 'Folder1',
			ownerId: otherUser.id,
			parentId: null,
			color: '#78BC61',
		});

		const sharing = await sharingService.createSharing(
			{
				itemId: folder.id,
				userId: user.id,
			},
			otherUser.id,
		);

		await starredService.createStarred({
			itemId: folder.id,
			userId: user.id,
		});

		await sharingService.deleteSharingByIdAndUserId(sharing.id, user.id);

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/starred/' + folder.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(204);
		expect(response.body).toBe('');

		await expect(starredService.getByItemIdAndUserId(folder.id, user.id)).rejects.toThrowError();
	});

	it("should return status 400, when starred id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/starred/invalid_id',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				id: ['id must be a number'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when starred with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'DELETE',
			url: '/api/starred/1234',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'BadRequestError',
			errors: {
				_: ['Starred not found'],
			},
			statusCode: 400,
		});
	});
});
