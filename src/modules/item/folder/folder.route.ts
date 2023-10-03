import { FastifyInstance } from 'fastify';
import FolderController from './folder.controller';
import FolderService from './folder.service';

export default async (fastify: FastifyInstance) => {
	const folderController = new FolderController(new FolderService());

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
