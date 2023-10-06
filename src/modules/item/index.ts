import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import folder from './folder';
import { getOptionsWithPrefix } from '..';
import blob from './blob';
import sharing from './sharing';
import { itemSchemas } from './item.schema';
import itemRoute from './item.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	await fastify.register(blob, getOptionsWithPrefix(options, '/blob'));
	await fastify.register(folder, getOptionsWithPrefix(options, '/folder'));
	await fastify.register(sharing, getOptionsWithPrefix(options, '/sharing'));
	await fastify.register(itemRoute, getOptionsWithPrefix(options, '/item'));

	for (const schema of itemSchemas) {
		fastify.addSchema(schema);
	}
});
