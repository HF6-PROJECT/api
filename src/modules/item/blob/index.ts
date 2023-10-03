import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import { blobSchemas } from './blob.schema';
import blobRoute from './blob.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of blobSchemas) {
		fastify.addSchema(schema);
	}

	await fastify.register(blobRoute, options);
});
