import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import { docsSchemas } from './docs.schema';
import docsRoute from './docs.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of docsSchemas) {
		fastify.addSchema(schema);
	}

	await fastify.register(docsRoute, options);
});
