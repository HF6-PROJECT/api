import { FastifyInstance } from 'fastify';
import DocsController from './docs.controller';
import DocsService from './docs.service';
import AccessService from '../sharing/access.service';
import ItemService from '../item.service';
import SharingService from '../sharing/sharing.service';

export default async (fastify: FastifyInstance) => {
	const itemService = new ItemService();
	const docsService = new DocsService();
	const docsController = new DocsController(
		docsService,
		new AccessService(itemService, new SharingService(itemService)),
	);

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
