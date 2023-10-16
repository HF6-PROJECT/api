import { FastifyInstance } from 'fastify';
import { AuthControllerFactory } from './auth.factory';

export default async (fastify: FastifyInstance) => {
	const authController = AuthControllerFactory.make();

	fastify.post(
		'/register',
		{
			schema: {
				tags: ['Auth'],
				body: { $ref: 'createUserSchema' },
				response: {
					201: { $ref: 'createUserResponseSchema' },
				},
			},
		},
		authController.registerUserHandler.bind(authController),
	);

	fastify.post(
		'/login',
		{
			schema: {
				tags: ['Auth'],
				body: { $ref: 'loginSchema' },
				response: {
					200: { $ref: 'loginResponseSchema' },
				},
			},
		},
		authController.loginHandler.bind(authController),
	);

	fastify.post(
		'/refresh',
		{
			schema: {
				tags: ['Auth'],
				response: {
					200: { $ref: 'refreshResponseSchema' },
				},
				description: 'The `refreshToken` cookie is required',
			},
		},
		authController.refreshHandler.bind(authController),
	);

	fastify.post(
		'/logout',
		{
			schema: {
				tags: ['Auth'],
				response: {
					200: { $ref: 'logoutResponseSchema' },
				},
			},
			onRequest: [fastify.authenticate],
		},
		authController.logoutHandler.bind(authController),
	);

	fastify.get(
		'/user',
		{
			schema: {
				tags: ['Auth'],
				response: {
					200: { $ref: 'userResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		authController.userHandler.bind(authController),
	);
};
