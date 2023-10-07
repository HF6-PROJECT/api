import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';
import DocsService from '../docs.service';

describe('POST /api/docs', () => {
	let userService: UserService;
	let authService: AuthService;
	let docsService: DocsService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();
		docsService = new DocsService();

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

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Docs Name',
				text: 'Hej mit navn er test 123',
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			id: expect.any(Number),
			name: 'Docs Name',
			text: 'Hej mit navn er test 123',
			parentId: null,
			ownerId: user.id,
			mimeType: 'application/vnd.cloudstore.docs',
			createdAt: expect.any(String),
			deletedAt: null,
			updatedAt: expect.any(String),
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/docs',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				name: 'Docs Name',
				text: 'Hej mit navn er test 123',
				parentId: null,
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

	it('should return status 401, when parent id is provided, but no access to parent', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const docs = await docsService.createDocs({
			name: 'Docs1',
			ownerId: otherUser.id,
			parentId: null,
			text: 'Hej mit navn er test 123',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Docs Name',
				text: 'Hej mit navn er test 123',
				parentId: docs.id,
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

	it('should return status 401, when docs name is not provided', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				text: 'Hej mit navn er test 123',
				parentId: null,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['Name is required'],
			},
			statusCode: 400,
		});
	});

	it('should return status 401, when docs text is not provided', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Docs name',
				parentId: null,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				_: ['Text is required'],
			},
			statusCode: 400,
		});
	});

	it("should return status 400, when parent id isn't a number", async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/docs',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				name: 'Docs Name',
				text: 'Hej mit navn er test 123',
				parentId: 'invalid_id',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'ValidationError',
			errors: {
				parentId: ['Parent id must be a number'],
			},
			statusCode: 400,
		});
	});
});
