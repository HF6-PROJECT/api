import { FastifyInstance } from 'fastify';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import UserService from './user.service';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';

export default async (Fastify: FastifyInstance) => {
	const authController = new AuthController(new AuthService(), new UserService());

	const fastify = Fastify.withTypeProvider<JsonSchemaToTsProvider>();

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
				headers: {
					Authorization: true,
				},
				tags: ['Auth'],
				response: {
					200: { $ref: 'userResponseSchema' },
				},
			},
			onRequest: [fastify.authenticate],
		},
		authController.userHandler.bind(authController),
	);
};
