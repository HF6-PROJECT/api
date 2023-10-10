import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { getOptionsWithPrefix } from '..';
import blob from './blob';
import docs from './docs';
import folder from './folder';
import sharing from './sharing';
import itemRoute from './item.route';
import shortcut from './shortcut';
import starred from './starred';
import { itemSchemas } from './item.schema';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	await fastify.register(blob, getOptionsWithPrefix(options, '/blob'));
	await fastify.register(docs, getOptionsWithPrefix(options, '/docs'));
	await fastify.register(folder, getOptionsWithPrefix(options, '/folder'));
	await fastify.register(sharing, getOptionsWithPrefix(options, '/sharing'));
	await fastify.register(shortcut, getOptionsWithPrefix(options, '/shortcut'));
	await fastify.register(starred, getOptionsWithPrefix(options, '/starred'));
	await fastify.register(itemRoute, getOptionsWithPrefix(options, '/item'));

	for (const schema of itemSchemas) {
		fastify.addSchema(schema);
	}
});
