import { FastifyInstance } from 'fastify';
import ItemController from './item.controller';
import ItemService from './item.service';
import BlobService from './blob.service';

export default async (fastify: FastifyInstance) => {
	const itemController = new ItemController(new ItemService(), new BlobService());

	fastify.post(
		'/',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Item'],
				body: { $ref: 'uploadItemSchema' },
				response: {
					200: { $ref: 'uploadItemResponseSchema' },
				},
			},
		},
		itemController.uploadHandler.bind(itemController),
	);
};
