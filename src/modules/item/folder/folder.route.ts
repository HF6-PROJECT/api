import { FastifyInstance } from 'fastify';
import FolderController from './folder.controller';
import FolderService from './folder.service';
import AccessService from '../sharing/access.service';
import ItemService from '../item.service';
import SharingService from '../sharing/sharing.service';

export default async (fastify: FastifyInstance) => {
	const folderService = new FolderService();
	const folderController = new FolderController(
		folderService,
		new AccessService(new ItemService(), new SharingService()),
	);

	fastify.get(
		'/:id',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Folder'],
				params: { $ref: 'readFolderSchema' },
				response: {
					200: { $ref: 'readFolderResponseSchema' },
				},
			},
			onRequest: [fastify.authenticate],
		},
		folderController.readHandler.bind(folderController),
	);

	fastify.put(
		'/',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Folder'],
				body: { $ref: 'editFolderSchema' },
				response: {
					200: { $ref: 'editFolderResponseSchema' },
				},
			},
			onRequest: [fastify.authenticate],
		},
		folderController.editHandler.bind(folderController),
	);

	fastify.post(
		'/',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Folder'],
				body: { $ref: 'addFolderSchema' },
				response: {
					200: { $ref: 'addFolderResponseSchema' },
				},
			},
			onRequest: [fastify.authenticate],
		},
		folderController.addHandler.bind(folderController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Folder'],
				params: { $ref: 'deleteFolderSchema' },
			},
			onRequest: [fastify.authenticate],
		},
		folderController.deleteHandler.bind(folderController),
	);
};
