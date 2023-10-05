import { FastifyInstance } from 'fastify';
import BlobController from './blob.controller';
import BlobService from './blob.service';
import SharingService from '../sharing/sharing.service';
import ItemService from '../item.service';
import AccessService from '../sharing/access.service';

export default async (fastify: FastifyInstance) => {
	const blobController = new BlobController(
		new BlobService(),
		new AccessService(new ItemService(), new SharingService()),
	);

	fastify.get(
		'/:id',
		{
			schema: {
				tags: ['Blob'],
				params: { $ref: 'readBlobSchema' },
				response: {
					200: {
						$ref: 'readBlobResponseSchema',
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
		blobController.readHandler.bind(blobController),
	);

	fastify.put(
		'/',
		{
			schema: {
				tags: ['Blob'],
				body: { $ref: 'editBlobSchema' },
				response: {
					200: {
						$ref: 'editBlobResponseSchema',
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
		blobController.editHandler.bind(blobController),
	);

	fastify.post(
		'/',
		{
			schema: {
				tags: ['Blob'],
				body: { $ref: 'uploadBlobSchema' },
				response: {
					200: { $ref: 'uploadBlobResponseSchema' },
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		blobController.addHandler.bind(blobController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				tags: ['Blob'],
				params: { $ref: 'deleteBlobSchema' },
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			onRequest: [fastify.authenticate],
		},
		blobController.deleteHandler.bind(blobController),
	);
};
