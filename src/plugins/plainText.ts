import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		fastify.addContentTypeParser('text/plain', { parseAs: 'string' }, (req, body: string, done) => {
			try {
				const json = JSON.parse(body);

				return done(null, json);
			} catch (e) {
				if (e instanceof Error) {
					return done(fastify.httpErrors.badRequest(e.message), null);
				}

				/* istanbul ignore next */
				return done(null, null);
			}
		});
	},
	{ name: 'plainText' },
);
