import { FastifyInstance } from 'fastify';
import { DocsControllerFactory } from './docs.factory';

export default async (fastify: FastifyInstance) => {
	const docsController = DocsControllerFactory.make();

	fastify.get(
		'/:id',
		{
			schema: {
				tags: ['Docs'],
				params: { $ref: 'readDocsSchema' },
				response: {
					200: { $ref: 'readDocsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		docsController.readHandler.bind(docsController),
	);

	fastify.put(
		'/',
		{
			schema: {
				tags: ['Docs'],
				body: { $ref: 'editDocsSchema' },
				response: {
					200: { $ref: 'editDocsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		docsController.editHandler.bind(docsController),
	);

	fastify.post(
		'/',
		{
			schema: {
				tags: ['Docs'],
				body: { $ref: 'addDocsSchema' },
				response: {
					200: { $ref: 'addDocsResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		docsController.addHandler.bind(docsController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				tags: ['Docs'],
				params: { $ref: 'deleteDocsSchema' },
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		docsController.deleteHandler.bind(docsController),
	);
};
