import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import { sharingSchemas } from './sharing.schema';
import sharingRoute from './sharing.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of sharingSchemas) {
		fastify.addSchema(schema);
	}

	await fastify.register(sharingRoute, options);
});
