import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import { shortcutSchemas } from './shortcut.schema';
import shortcutRoute from './shortcut.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of shortcutSchemas) {
		fastify.addSchema(schema);
	}

	await fastify.register(shortcutRoute, options);
});
