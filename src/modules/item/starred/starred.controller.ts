import { FastifyReply, FastifyRequest } from 'fastify';
import { AddInput, DeleteInput } from './starred.schema';
import StarredService from './starred.service';
import AccessService from '../sharing/access.service';
import { UnauthorizedError, errorReply } from '../../../utils/error';

export default class StarredController {
	private starredService: StarredService;
	private accessService: AccessService;

	constructor(starredService: StarredService, accessService: AccessService) {
		this.starredService = starredService;
		this.accessService = accessService;
	}

	public async addHandler(
		request: FastifyRequest<{
			Body: AddInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			if (!(await this.accessService.hasAccessToItem(request.body.itemId, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const starred = await this.starredService.createStarred({
				itemId: request.body.itemId,
				userId: request.user.sub,
			});

			return reply.code(200).send(starred);
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}

	public async deleteHandler(
		request: FastifyRequest<{
			Params: DeleteInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const starred = await this.starredService.getByItemIdAndUserId(
				request.params.id,
				request.user.sub,
			);

			await this.starredService.deleteStarredById(starred.id);
			return reply.code(204).send();
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}
}
