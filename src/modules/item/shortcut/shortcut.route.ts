import { FastifyInstance } from 'fastify';
import { ShortcutControllerFactory } from './shortcut.factory';

export default async (fastify: FastifyInstance) => {
	const shortcutController = ShortcutControllerFactory.make();

	fastify.get(
		'/:id',
		{
			schema: {
				tags: ['Shortcut'],
				params: { $ref: 'readShortcutSchema' },
				response: {
					200: { $ref: 'readShortcutResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		shortcutController.readHandler.bind(shortcutController),
	);

	fastify.put(
		'/',
		{
			schema: {
				tags: ['Shortcut'],
				body: { $ref: 'editShortcutSchema' },
				response: {
					200: { $ref: 'editShortcutResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		shortcutController.editHandler.bind(shortcutController),
	);

	fastify.post(
		'/',
		{
			schema: {
				tags: ['Shortcut'],
				body: { $ref: 'addShortcutSchema' },
				response: {
					200: { $ref: 'addShortcutResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		shortcutController.addHandler.bind(shortcutController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				tags: ['Shortcut'],
				params: { $ref: 'deleteShortcutSchema' },
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		shortcutController.deleteHandler.bind(shortcutController),
	);
};
