import { FastifyReply, FastifyRequest } from 'fastify';

export class BaseError extends Error {
	constructor(msg: string) {
		super(msg);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, BaseError.prototype);
	}
}

export class MissingError extends BaseError {
	constructor(msg: string) {
		super(msg);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, MissingError.prototype);
	}
}

export class UnauthorizedError extends BaseError {
	constructor(msg: string) {
		super(msg);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, UnauthorizedError.prototype);
	}
}

export class AlreadyExistsError extends BaseError {
	constructor(msg: string) {
		super(msg);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, AlreadyExistsError.prototype);
	}
}

export class BadRequestError extends BaseError {
	constructor(msg: string) {
		super(msg);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
}

export const errorReply = (request: FastifyRequest, reply: FastifyReply, error: unknown) => {
	if (error instanceof BaseError) {
		if (error instanceof UnauthorizedError) {
			return reply.unauthorized(request.i18n.t(error.message));
		}

		if (error instanceof MissingError) {
			return reply.notFound(request.i18n.t(error.message));
		}

		if (error instanceof AlreadyExistsError || error instanceof BadRequestError) {
			return reply.badRequest(request.i18n.t(error.message));
		}
	}

	/* istanbul ignore next */
	request.log.error(error);

	/* istanbul ignore next */
	return reply.internalServerError();
};
