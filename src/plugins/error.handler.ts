import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(async (fastify: FastifyInstance) => {
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

			return reply.status(400).send({
				error: 'ValidationError',
				errors: errors,
				statusCode: 400,
			});
		}

		return reply.status(error.statusCode ?? 500).send({
			error: error.name,
			errors: { _: [error.message] },
			statusCode: error.statusCode,
		});
	});
});
