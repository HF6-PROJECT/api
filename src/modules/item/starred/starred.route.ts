import { FastifyInstance } from 'fastify';
import { StarredControllerFactory } from './starred.factory';

export default async (fastify: FastifyInstance) => {
	const starredController = StarredControllerFactory.make();

	fastify.post(
		'/',
		{
			schema: {
				tags: ['Starred'],
				body: { $ref: 'addStarredSchema' },
				response: {
					200: { $ref: 'addStarredResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		starredController.addHandler.bind(starredController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				tags: ['Starred'],
				params: { $ref: 'deleteStarredSchema' },
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		starredController.deleteHandler.bind(starredController),
	);
};
