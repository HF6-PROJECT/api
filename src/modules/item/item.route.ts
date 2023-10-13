import { FastifyInstance } from 'fastify';
import { ItemControllerFactory } from './item.factory';

export default async (fastify: FastifyInstance) => {
	const itemController = ItemControllerFactory.make();

	fastify.get(
		'/starred',
		{
			schema: {
				tags: ['Item'],
				response: {
					200: { $ref: 'itemsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		itemController.itemStarredHandler.bind(itemController),
	);

	fastify.get(
		'/',
		{
			schema: {
				tags: ['Item'],
				response: {
					200: { $ref: 'itemsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		itemController.itemRootHandler.bind(itemController),
	);

	fastify.get(
		'/:parentId',
		{
			schema: {
				tags: ['Item'],
				params: { $ref: 'readItemsSchema' },
				response: {
					200: { $ref: 'itemsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		itemController.itemHandler.bind(itemController),
	);

	fastify.get(
		'/shared',
		{
			schema: {
				tags: ['Item'],
				response: {
					200: { $ref: 'itemsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		itemController.sharedItemHandler.bind(itemController),
	);

	fastify.get(
		'/:id/sharings',
		{
			schema: {
				tags: ['Item'],
				response: {
					200: { $ref: 'itemSharingsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		itemController.sharingsHandler.bind(itemController),
	);
};
