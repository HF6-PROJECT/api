import { FastifyInstance } from 'fastify';
import ItemController from './item.controller';
import ItemService from './item.service';
import AccessService from './sharing/access.service';
import SharingService from './sharing/sharing.service';

export default async (fastify: FastifyInstance) => {
	const itemService = new ItemService();
	const itemController = new ItemController(
		itemService,
		new AccessService(itemService, new SharingService()),
	);

	fastify.get(
		'/',
		{
			schema: {
				tags: ['Items'],
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
		itemController.browseHandler.bind(itemController),
	);

	fastify.get(
		'/:parentId',
		{
			schema: {
				tags: ['Items'],
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
		itemController.readHandler.bind(itemController),
	);
};
