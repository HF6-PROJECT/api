import { FastifyReply, FastifyRequest } from 'fastify';
import { ReadInput, EditInput, AddInput, DeleteInput } from './shortcut.schema';
import ShortcutService from './shortcut.service';
import AccessService from '../sharing/access.service';
import { ItemEventType, triggerItemEvent } from '../item.event';
import { UnauthorizedError, errorReply } from '../../../utils/error';

export default class ShortcutController {
	private shortcutService: ShortcutService;
	private accessService: AccessService;

	constructor(shortcutService: ShortcutService, accessService: AccessService) {
		this.shortcutService = shortcutService;
		this.accessService = accessService;
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const shortcut = await this.shortcutService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItemId(shortcut.id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			return reply.code(200).send(shortcut);
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}

	public async editHandler(
		request: FastifyRequest<{
			Body: EditInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const shortcut = await this.shortcutService.getByItemId(request.body.id);

			if (!(await this.accessService.hasAccessToItemId(shortcut.id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			if (
				request.body.parentId !== null &&
				request.body.parentId !== undefined &&
				!(await this.accessService.hasAccessToItemId(request.body.parentId, request.user.sub))
			) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const updatedShortcut = await this.shortcutService.updateShortcut(request.body);

			await triggerItemEvent(updatedShortcut, ItemEventType.UPDATE);

			return reply.code(200).send(updatedShortcut);
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}

	public async addHandler(
		request: FastifyRequest<{
			Body: AddInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			if (
				request.body.parentId !== null &&
				request.body.parentId !== undefined &&
				!(await this.accessService.hasAccessToItemId(request.body.parentId, request.user.sub))
			) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const shortcut = await this.shortcutService.createShortcut({
				name: request.body.name,
				linkedItemId: request.body.linkedItemId,
				ownerId: request.user.sub,
				parentId: request.body.parentId ?? null,
			});

			await triggerItemEvent(shortcut, ItemEventType.UPDATE);

			return reply.code(200).send(shortcut);
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
			const shortcut = await this.shortcutService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItemId(shortcut.id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			await this.shortcutService.deleteShortcutByItemId(shortcut.id);

			await triggerItemEvent(shortcut, ItemEventType.DELETE);

			return reply.code(204).send();
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}
}
