import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import BlobService from '../blob.service';
import { AuthServiceFactory, UserServiceFactory } from '../../../auth/auth.factory';
import { BlobServiceFactory } from '../blob.factory';

describe('PUT /api/blob', () => {
	let userService: UserService;
	let authService: AuthService;
	let blobService: BlobService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = AuthServiceFactory.make();
		userService = UserServiceFactory.make();
		blobService = BlobServiceFactory.make();

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

	it('should return status 200 and blob', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: null,
			blobUrl: 'https://example.com/test1.txt',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/blob',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: blob.id,
				name: blob.name + ' updated',
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			...blob,
			name: blob.name + ' updated',
			createdAt: blob.createdAt.toISOString(),
			updatedAt: expect.any(String),
			deletedAt: blob.deletedAt?.toISOString() ?? null,
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test1.txt',
			ownerId: user.id,
			parentId: null,
			blobUrl: 'https://example.com/test1.txt',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/blob',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				id: blob.id,
				name: blob.name + ' updated',
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

	it('should return status 401, when blob id is provided but you do not own it', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const blob = await blobService.createBlob({
			mimeType: 'text/plain',
			name: 'test.txt',
			ownerId: otherUser.id,
			parentId: null,
			blobUrl: 'https://example.com/test.txt',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/blob',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: blob.id,
				name: blob.name + ' updated',
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

	it("should return status 400, when blob id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/blob',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 'invalid_id',
				name: 'updated',
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

	it("should return status 404, when blob with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/blob',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 1234,
				name: 'updated',
			},
		});

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			error: 'NotFoundError',
			errors: {
				_: ['Blob not found'],
			},
			statusCode: 404,
		});
	});
});
