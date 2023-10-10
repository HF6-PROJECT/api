import { FastifyInstance } from 'fastify';
import StarredController from './starred.controller';
import StarredService from './starred.service';
import AccessService from '../sharing/access.service';
import ItemService from '../item.service';
import SharingService from '../sharing/sharing.service';

export default async (fastify: FastifyInstance) => {
	const itemService = new ItemService();
	const starredService = new StarredService();
	const starredController = new StarredController(
		starredService,
		new AccessService(itemService, new SharingService(itemService)),
	);

	fastify.get(
		'/',
		{
			schema: {
				tags: ['Starred'],
				response: {
					200: { $ref: 'browseStarredResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		starredController.browseHandler.bind(starredController),
	);

	fastify.get(
		'/:id',
		{
			schema: {
				tags: ['Starred'],
				params: { $ref: 'readStarredSchema' },
				response: {
					200: { $ref: 'readStarredResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		starredController.readHandler.bind(starredController),
	);

	fastify.post(
		'/',
		{
			schema: {
				tags: ['Starred'],
				body: { $ref: 'addStarredSchema' },
				response: {
					200: { $ref: 'addStarredResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		starredController.addHandler.bind(starredController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				tags: ['Starred'],
				params: { $ref: 'deleteStarredSchema' },
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		starredController.deleteHandler.bind(starredController),
	);
};
