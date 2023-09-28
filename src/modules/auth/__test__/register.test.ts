import { request } from 'http';
import { prisma } from '../../../plugins/prisma';
import UserService from '../user.service';
import i18next from 'i18next';

describe('POST /api/auth/register', () => {
	let userService: UserService;

	beforeAll(async () => {
		userService = new UserService();
	});

	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	it('should return status 201 and create a user', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				email: 'joe@biden.com',
				password: '12345678',
			},
		});

		expect(response.statusCode).toBe(201);
		expect(response.json()).toEqual({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
		});
	});

	it('should return status 400, when email is already in use', async () => {
		await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '12345678',
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				email: 'joe@biden.com',
				password: '12345678',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			message: 'Email is already in use',
			statusCode: 400,
		});
	});

	it('should return status 400, when email is invalid', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				email: 'joebiden.com',
				password: '12345678',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				email: ['Email must be of correct format'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when no email has been provided', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				password: '12345678',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				_: ['Email is required'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when email is empty', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				email: '',
				password: '12345678',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				email: ['Email must be of correct format'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when no password has been provided', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				email: 'joe@biden.com',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				_: ['Password is required'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when password is empty', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				email: 'joe@biden.com',
				password: '',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				password: ['Password must be atleast 8 characters'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when password is less than 8 characters', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: 'Joe Biden the 1st',
				email: 'joe@biden.com',
				password: '1234567',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				password: ['Password must be atleast 8 characters'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when no name has been provided', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				email: 'joe@biden.com',
				password: '12345678',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				_: ['Name is required'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when name is empty', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {
				name: '',
				email: 'joe@biden.com',
				password: '12345678',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				name: ['You must choose a name'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when name, email and password is not provided', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				_: ['Email is required', 'Password is required', 'Name is required'],
			},
			statusCode: 400,
		});
	});

	it('should return status 400, when name, email and password is not provided, in danish', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/register',
			payload: {},
			headers: {
				'accept-language': 'da',
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			errors: {
				_: ['Email er påkrævet', 'Adgangskode er påkrævet', 'Navn er påkrævet'],
			},
			statusCode: 400,
		});
	});
});
