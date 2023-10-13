import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import Pusher from 'pusher';

export let pusher: Pusher;

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
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
