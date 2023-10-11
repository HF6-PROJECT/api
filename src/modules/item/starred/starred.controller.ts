import { FastifyReply, FastifyRequest } from 'fastify';
import { ReadInput, AddInput, DeleteInput } from './starred.schema';
import StarredService from './starred.service';
import AccessService from '../sharing/access.service';

export default class StarredController {
	private starredService: StarredService;
	private accessService: AccessService;

	constructor(starredService: StarredService, accessService: AccessService) {
		this.starredService = starredService;
		this.accessService = accessService;
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const starred = await this.starredService.getById(request.params.id);

			if (!(await this.accessService.hasAccessToItem(starred.id, request.user.sub))) {
				return reply.unauthorized();
			}

			return reply.code(200).send(starred);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async addHandler(
		request: FastifyRequest<{
			Body: AddInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			if (!(await this.accessService.hasAccessToItem(request.body.itemId, request.user.sub))) {
				return reply.unauthorized();
			}

			const starred = await this.starredService.createStarred({
				itemId: request.body.itemId,
				userId: request.user.sub,
			});

			return reply.code(200).send(starred);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async deleteHandler(
		request: FastifyRequest<{
			Params: DeleteInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const starred = await this.starredService.getById(request.params.id);

			if (!(await this.accessService.hasAccessToItem(starred.id, request.user.sub))) {
				return reply.unauthorized();
			}

			await this.starredService.deleteStarredById(starred.id);
			return reply.code(204).send();
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}
}
