import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import folder from './folder';
import { getOptionsWithPrefix } from '..';
import blob from './blob';
import sharing from './sharing';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	await fastify.register(blob, getOptionsWithPrefix(options, '/blob'));
	await fastify.register(folder, getOptionsWithPrefix(options, '/folder'));
	await fastify.register(sharing, getOptionsWithPrefix(options, '/sharing'));
});
