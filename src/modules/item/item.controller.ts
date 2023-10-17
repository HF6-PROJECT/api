import { FastifyReply, FastifyRequest } from 'fastify';
import ItemService from './item.service';
import { ReadInput, itemSharingsInput, itemReadInput } from './item.schema';
import AccessService from './sharing/access.service';

export default class ItemController {
	private itemService: ItemService;
	private accessService: AccessService;

	constructor(itemService: ItemService, accessService: AccessService) {
		this.itemService = itemService;
		this.accessService = accessService;
	}

	public async itemStarredHandler(request: FastifyRequest, reply: FastifyReply) {
		try {
			const starred = await this.itemService.getStarredItemsByUserId(request.user.sub);

			return reply.code(200).send(starred);
		} catch (e) {
			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async itemRootHandler(request: FastifyRequest, reply: FastifyReply) {
		try {
			const items = await this.itemService.getByOwnerIdAndParentId(request.user.sub, null);

			return reply.code(200).send(items);
		} catch (e) {
			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async itemHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			if (!(await this.accessService.hasAccessToItem(request.params.parentId, request.user.sub))) {
				return reply.unauthorized();
			}

			const items = await this.itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(
				request.user.sub,
				request.params.parentId,
			);

			return reply.code(200).send(items);
		} catch (e) {
			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async sharedItemHandler(request: FastifyRequest, reply: FastifyReply) {
		try {
			const items = await this.itemService.getAllSharedItemsByUserId(request.user.sub);

			return reply.code(200).send(items);
		} catch (e) {
			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: itemReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const id = Number.parseInt(request.params.id);

			if (!(await this.accessService.hasAccessToItem(id, request.user.sub))) {
				return reply.unauthorized();
			}

			const item = await this.itemService.getItemByIdWithInclude(id, request.user.sub);

			return reply.code(200).send(item);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}

	public async sharingsHandler(
		request: FastifyRequest<{
			Params: itemSharingsInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const id = Number.parseInt(request.params.id);

			if (!(await this.accessService.hasAccessToItem(id, request.user.sub))) {
				return reply.unauthorized();
			}

			const item = await this.itemService.getItemByIdWithSharingsAndOwner(id);

			return reply.code(200).send(item);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}
}
