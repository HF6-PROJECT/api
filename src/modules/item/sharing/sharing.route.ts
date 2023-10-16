import { FastifyInstance } from 'fastify';
import { SharingControllerFactory } from './sharing.factory';

export default async (fastify: FastifyInstance) => {
	const sharingController = SharingControllerFactory.make();

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
				body: { $ref: 'addSharingSchema' },
				response: {
					200: { $ref: 'addSharingResponseSchema' },
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
