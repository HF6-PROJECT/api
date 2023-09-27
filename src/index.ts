import Fastify from 'fastify';
import plugins from './plugins';
import modules from './modules';

const getLoggerConfig = () => {
	switch (process.env.NODE_ENV) {
		case 'test':
			return false;
		/* istanbul ignore next */
		case 'local':
			return {
				transport: {
					target: 'pino-pretty',
					options: {
						translateTime: 'HH:MM:ss Z',
						ignore: 'pid,hostname',
					},
				},
			};
		/* istanbul ignore next */
		default:
			return true;
	}
};

export async function build() {
	const fastify = Fastify({
		logger: getLoggerConfig(),
		ajv: {
			customOptions: {
				allErrors: true,
			},
			plugins: [require('ajv-errors')],
		},
	});

	fastify.setErrorHandler(function (error, request, reply) {
		if (error.validation) {
			const errors: { [key: string]: Array<string | undefined> } = {};
			error.validation.forEach((err) => {
				let pathName = err.instancePath.substring(1).toString();

				if (pathName === '') {
					pathName = '_';
				}

				if (!errors[pathName]) {
					errors[pathName] = [];
				}

				errors[pathName].push(request.i18n.t(err.message));
			});

			return reply.status(400).send(errors);
		}

		return reply.send(error);
	});

	const startPlugins = performance.now();
	await fastify.register(plugins);
	fastify.log.info(`Plugins ${(performance.now() - startPlugins).toFixed(2)} ms`);

	const startModules = performance.now();
	await fastify.register(modules, { prefix: '/api' });
	fastify.log.info(`Modules ${(performance.now() - startModules).toFixed(2)} ms`);

	return fastify;
}
