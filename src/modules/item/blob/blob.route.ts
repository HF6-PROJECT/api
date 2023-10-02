import { FastifyInstance } from 'fastify';
import BlobController from './blob.controller';
import BlobService from './blob.service';

export default async (fastify: FastifyInstance) => {
	const blobController = new BlobController(new BlobService());

	fastify.get(
		'/:id',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Blob'],
				params: { $ref: 'readBlobSchema' },
				response: {
					200: {
						$ref: 'readBlobResponseSchema',
					},
				},
			},
			onRequest: [fastify.authenticate],
		},
		blobController.readHandler.bind(blobController),
	);

	fastify.put(
		'/',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Blob'],
				body: { $ref: 'editBlobSchema' },
				response: {
					200: {
						$ref: 'editBlobResponseSchema',
					},
				},
			},
			onRequest: [fastify.authenticate],
		},
		blobController.editHandler.bind(blobController),
	);

	fastify.post(
		'/',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Blob'],
				body: { $ref: 'uploadBlobSchema' },
				response: {
					200: { $ref: 'uploadBlobResponseSchema' },
				},
			},
		},
		blobController.addHandler.bind(blobController),
	);

	fastify.delete(
		'/:id',
		{
			schema: {
				headers: {
					Authorization: true,
				},
				tags: ['Blob'],
				params: { $ref: 'deleteBlobSchema' },
			},
			onRequest: [fastify.authenticate],
		},
		blobController.deleteHandler.bind(blobController),
	);
};
