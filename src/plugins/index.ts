import { FastifyInstance } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import config from './config';
import sensible from './sensible';
import prisma from './prisma';
import redis from './redis';
import swagger from './swagger';
import cookie from './cookie';
import cors from './cors';
import jwt from './jwt';
import i18n from './i18n';
import errorHandler from './error.handler';
import plainText from './plainText';
import pusher from './pusher';

export default fastifyPlugin(async (fastify: FastifyInstance) => {
	await Promise.all([
		fastify.register(config),
		fastify.register(sensible),
		fastify.register(i18n),
		fastify.register(errorHandler),
		fastify.register(plainText),
	]);

	await Promise.all([
		fastify.register(prisma),
		fastify.register(pusher),
		fastify.register(redis),
		fastify.register(cookie),
		fastify.register(cors),
		fastify.config.NODE_ENV === 'local'
			? /* istanbul ignore next */ fastify.register(swagger)
			: /* istanbul ignore next */ null,
	]);

	await Promise.all([fastify.register(jwt)]);
});
