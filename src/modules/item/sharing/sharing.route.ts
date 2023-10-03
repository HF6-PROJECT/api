import { FastifyInstance } from 'fastify';
import SharingController from './sharing.controller';
import SharingService from './sharing.service';
import AccessService from './access.service';
import ItemService from '../item.service';

export default async (fastify: FastifyInstance) => {
	const sharingService = new SharingService();
	const sharingController = new SharingController(
		sharingService,
		new AccessService(new ItemService(), sharingService),
	);

	fastify.get(
		'/:id',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Sharing'],
				params: { $ref: 'readSharingSchema' },
				response: {
					200: {
						$ref: 'readSharingResponseSchema',
					},
				},
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.readHandler.bind(sharingController),
	);

	fastify.put(
		'/',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Sharing'],
				body: { $ref: 'editSharingSchema' },
				response: {
					200: {
						$ref: 'editSharingResponseSchema',
					},
				},
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.editHandler.bind(sharingController),
	);

	fastify.post(
		'/',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Sharing'],
				body: { $ref: 'uploadSharingSchema' },
				response: {
					200: { $ref: 'uploadSharingResponseSchema' },
				},
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.addHandler.bind(sharingController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Sharing'],
				params: { $ref: 'deleteSharingSchema' },
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.deleteHandler.bind(sharingController),
	);
};
