import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import AuthService from '../../../auth/auth.service';

describe('POST /api/blob', () => {
	let userService: UserService;
	let authService: AuthService;

	let user: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
	});

	/*
	 * Generate client token tests
	 */
	it('should return status 200 and return a new clientToken', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/blob',
			headers: {
				'content-type': 'text/plain',
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				type: 'blob.generate-client-token',
				payload: {
					callbackUrl: 'https://example.com/callback',
					clientPayload: JSON.stringify({ parentId: null }),
					pathname: 'test.txt',
				},
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			type: 'blob.generate-client-token',
			clientToken: expect.any(String),
		});
	});

	it('should return status 401, when unauthorized', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/blob',
			headers: {
				'content-type': 'text/plain',
				authorization: 'invalid_access_token!!!',
			},
			payload: {
				type: 'blob.generate-client-token',
				payload: {
					callbackUrl: 'https://example.com/callback',
					clientPayload: JSON.stringify({ parentId: null }),
					pathname: 'test.txt',
				},
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toEqual({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});

	it('should return status 400, when clientPayload is missing', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/blob',
			headers: {
				'content-type': 'text/plain',
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				type: 'blob.generate-client-token',
				payload: {
					callbackUrl: 'https://example.com/callback',
					pathname: 'test.txt',
				},
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'Bad Request',
			message: 'clientPayload is required',
			statusCode: 400,
		});
	});

	it('should return status 400, when clientPayload.parentId is missing', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/blob',
			headers: {
				'content-type': 'text/plain',
				authorization: 'Bearer ' + accessToken,
			},
			payload: {
				type: 'blob.generate-client-token',
				payload: {
					callbackUrl: 'https://example.com/callback',
					clientPayload: JSON.stringify({}),
					pathname: 'test.txt',
				},
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'Bad Request',
			message: 'clientPayload.parentId is required',
			statusCode: 400,
		});
	});

	it('should return status 400, when providing invalid json string as payload', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/blob',
			headers: {
				'content-type': 'text/plain',
				authorization: 'Bearer ' + accessToken,
			},
			payload: 'Invalid json',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'Bad Request',
			message: expect.stringContaining('Unexpected token'),
			statusCode: 400,
		});
	});

	/*
	 * Upload completed callback tests
	 */
	it('should return status 400, when called without valid "x-vercel-signature" header', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/blob',
			headers: {
				'content-type': 'text/plain',
			},
			payload: {
				type: 'blob.upload-completed',
				payload: {
					blob: {
						url: 'https://example.com/test-ihufsdihudsfuds.txt',
						pathname: 'test.txt',
						contentType: 'text/plain',
						contentDisposition: 'attachment; filename="test.txt"',
					},
					tokenPayload: JSON.stringify({ parentId: null, ownerId: user.id }),
				},
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'Bad Request',
			message: 'Vercel Blob: Missing callback signature',
			statusCode: 400,
		});
	});
});
