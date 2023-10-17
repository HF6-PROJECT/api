import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import DocsService from '../docs.service';
import { AuthServiceFactory, UserServiceFactory } from '../../../auth/auth.factory';
import { DocsServiceFactory } from '../docs.factory';

describe('PUT /api/docs', () => {
	let userService: UserService;
	let authService: AuthService;
	let docsService: DocsService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = AuthServiceFactory.make();
		userService = UserServiceFactory.make();
		docsService = DocsServiceFactory.make();

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

	it('should return status 200 and docs', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const docs = await docsService.createDocs({
			name: 'Docs1',
			ownerId: user.id,
			parentId: null,
			text: 'Hej mit navn er test 123',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: docs.id,
				name: docs.name + ' updated',
				text: 'Hej mit navn er test 123',
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			...docs,
			name: docs.name + ' updated',
			text: 'Hej mit navn er test 123',
			createdAt: docs.createdAt.toISOString(),
			updatedAt: expect.any(String),
			deletedAt: docs.deletedAt?.toISOString() ?? null,
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const docs = await docsService.createDocs({
			name: 'Docs1',
			ownerId: user.id,
			parentId: null,
			text: 'Hej mit navn er test 123',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/docs',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				id: docs.id,
				name: docs.name + ' updated',
				text: 'Hej mit navn er test 123',
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

	it('should return status 401, when docs id is not accessible to you', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const docs = await docsService.createDocs({
			name: 'Docs1',
			ownerId: otherUser.id,
			parentId: null,
			text: 'Hej mit navn er test 123',
		});

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: docs.id,
				name: docs.name + ' updated',
				text: 'Hej mit navn er test 123',
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

	it("should return status 400, when docs id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 'invalid_id',
				name: 'updated',
				text: 'Hej mit navn er test 123',
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

	it("should return status 400, when docs id isn't given", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'updated',
				text: 'Hej mit navn er test 123',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['id is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 404, when docs with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'PUT',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				id: 1234,
				name: 'updated',
				text: 'Hej mit navn er test 123',
			},
		});

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			error: 'NotFoundError',
			errors: {
				_: ['Docs not found'],
			},
			statusCode: 404,
		});
	});
});
