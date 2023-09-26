import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import itemRoute from './item.route';
import { itemSchemas } from './item.schema';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of itemSchemas) {
		fastify.addSchema(schema);
	}

	await fastify.register(itemRoute, options);
});
