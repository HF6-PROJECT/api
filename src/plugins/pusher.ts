import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import Pusher from 'pusher';

export let pusher: Pusher;

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		if (
			!fastify.config.PUSHER_APP_SECRET &&
			!fastify.config.PUSHER_APP_CLUSTER &&
			!fastify.config.PUSHER_APP_KEY &&
			!fastify.config.PUSHER_APP_ID
		) {
			fastify.log.fatal('Missing PUSHER ENV variables');
			throw new Error('Missing PUSHER ENV variables');
		}

		pusher = new Pusher({
			appId: fastify.config.PUSHER_APP_ID,
			key: fastify.config.PUSHER_APP_KEY,
			secret: fastify.config.PUSHER_APP_SECRET,
			cluster: fastify.config.PUSHER_APP_CLUSTER,
			useTLS: true,
		});
	},
	{ dependencies: ['config'] },
);
