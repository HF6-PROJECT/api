import { FastifyInstance } from 'fastify';
import ItemController from './item.controller';
import ItemService from './item.service';
import AccessService from './sharing/access.service';
import SharingService from './sharing/sharing.service';

export default async (fastify: FastifyInstance) => {
	const itemService = new ItemService();
	const itemController = new ItemController(
		itemService,
		new AccessService(itemService, new SharingService(itemService)),
	);

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
		'/:id/single',
		{
			schema: {
				tags: ['Item'],
				response: {
					200: { $ref: 'itemFolderDocsBlobResponseSchema' },
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

	fastify.get(
		'/folders',
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
		itemController.browseHandler.bind(itemController),
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
