import { FastifyReply, FastifyRequest } from 'fastify';
import ItemService from './item.service';
import { ReadInput } from './item.schema';
import AccessService from './sharing/access.service';

export default class ItemController {
	private itemService: ItemService;
	private accessService: AccessService;

	constructor(itemService: ItemService, accessService: AccessService) {
		this.itemService = itemService;
		this.accessService = accessService;
	}

	public async browseHandler(request: FastifyRequest, reply: FastifyReply) {
		try {
			const items = await this.itemService.getByOwnerIdAndParentId(request.user.sub, null);

			return reply.code(200).send(items);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			if (!(await this.accessService.hasAccessToItem(request.params.parentId, request.user.sub))) {
				return reply.unauthorized();
			}

			const items = await this.itemService.getByOwnerIdAndParentIdAndSharred(
				request.user.sub,
				request.params.parentId,
			);

			return reply.code(200).send(items);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}
}
