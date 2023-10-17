import { FastifyInstance } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import i18n from 'fastify-i18n';
import en from '../locales/en.json';
import da from '../locales/da.json';

export default fastifyPlugin(async (fastify: FastifyInstance) => {
	await fastify.register(i18n, {
		fallbackLocale: 'en',
		messages: {
			en: en,
			da: da,
		},
	});
});
