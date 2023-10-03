import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import blob from './blob';
import { getOptionsWithPrefix } from '..';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	await fastify.register(blob, getOptionsWithPrefix(options, '/blob'));
});
