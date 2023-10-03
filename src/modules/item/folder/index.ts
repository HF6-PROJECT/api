import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import { folderSchemas } from './folder.schema';
import folderRoute from './folder.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of folderSchemas) {
		fastify.addSchema(schema);
	}

	await fastify.register(folderRoute, options);
});
