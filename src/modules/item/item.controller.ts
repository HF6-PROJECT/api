import { FastifyReply, FastifyRequest } from 'fastify';
import ItemService from './item.service';
import {
	ReadInput,
	itemSharingsInput,
	itemReadInput,
	itemBreadcrumbInput,
	ItemWithProperties,
} from './item.schema';
import AccessService from './sharing/access.service';
import { UnauthorizedError, errorReply } from '../../utils/error';

export const CACHE_ITEMS = 'items';
const CACHE_TTL = 86400;

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
			return errorReply(request, reply, e);
		}
	}

	public async itemRootHandler(request: FastifyRequest, reply: FastifyReply) {
		try {
			const items = await request.redis.rememberJSON<ItemWithProperties[]>(
				`${CACHE_ITEMS}:root:${request.user.sub}`,
				CACHE_TTL,
				async () => {
					return await this.itemService.getByOwnerIdAndParentId(request.user.sub, null);
				},
			);

			return reply.code(200).send(items);
		} catch (e) {
			/* istanbul ignore next */
			return errorReply(request, reply, e);
		}
	}

	public async itemHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			if (
				!(await this.accessService.hasAccessToItemId(request.params.parentId, request.user.sub))
			) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const items = await request.redis.rememberJSON<ItemWithProperties[]>(
				`${CACHE_ITEMS}:${request.params.parentId}:${request.user.sub}`,
				CACHE_TTL,
				async () => {
					return await this.itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(
						request.user.sub,
						request.params.parentId,
					);
				},
			);

			return reply.code(200).send(items);
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}

	public async sharedItemHandler(request: FastifyRequest, reply: FastifyReply) {
		try {
			const items = await this.itemService.getAllSharedItemsByUserId(request.user.sub);

			return reply.code(200).send(items);
		} catch (e) {
			/* istanbul ignore next */
			return errorReply(request, reply, e);
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

			if (!(await this.accessService.hasAccessToItemId(id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const item = await this.itemService.getItemByIdWithInclude(id, request.user.sub);

			return reply.code(200).send(item);
		} catch (e) {
			return errorReply(request, reply, e);
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

			if (!(await this.accessService.hasAccessToItemId(id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const item = await this.itemService.getItemByIdWithSharingsAndOwner(id);

			return reply.code(200).send(item);
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}

	public async breadcrumbHandler(
		request: FastifyRequest<{
			Params: itemBreadcrumbInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			if (!(await this.accessService.hasAccessToItemId(request.params.id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const itemPath = await this.itemService.getItemPath(request.params.id, request.user.sub);

			return reply.code(200).send(itemPath);
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}
}
