import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import DocsService from '../docs.service';
import { AuthServiceFactory, UserServiceFactory } from '../../../auth/auth.factory';
import { DocsServiceFactory } from '../docs.factory';

describe('GET /api/docs/:id', () => {
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
			method: 'GET',
			url: '/api/docs/' + docs.id,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			...docs,
			createdAt: docs.createdAt.toISOString(),
			updatedAt: docs.updatedAt.toISOString(),
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
			method: 'GET',
			url: '/api/docs/' + docs.id,
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

	it('should return status 401, when docs id is not accessible to you', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const docs = await docsService.createDocs({
			name: 'Docs1',
			ownerId: otherUser.id,
			parentId: null,
			text: 'Hej mit navn er test 123',
		});

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/docs/' + docs.id,
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

	it("should return status 400, when docs id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/docs/invalid_id',
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

	it("should return status 404, when docs with id doesn't exist", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/docs/1234',
			headers: {
				authorization: 'Bearer ' + accessToken,
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
