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
				tags: ['Sharing'],
				params: { $ref: 'readSharingSchema' },
				response: {
					200: {
						$ref: 'readSharingResponseSchema',
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.readHandler.bind(sharingController),
	);

	fastify.put(
		'/',
		{
			schema: {
				tags: ['Sharing'],
				body: { $ref: 'editSharingSchema' },
				response: {
					200: {
						$ref: 'editSharingResponseSchema',
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.editHandler.bind(sharingController),
	);

	fastify.post(
		'/',
		{
			schema: {
				tags: ['Sharing'],
				body: { $ref: 'uploadSharingSchema' },
				response: {
					200: { $ref: 'uploadSharingResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.addHandler.bind(sharingController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				tags: ['Sharing'],
				params: { $ref: 'deleteSharingSchema' },
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		sharingController.deleteHandler.bind(sharingController),
	);
};
