import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import { starredSchemas } from './starred.schema';
import starredRoute from './starred.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of starredSchemas) {
		fastify.addSchema(schema);
	}

	await fastify.register(starredRoute, options);
});
