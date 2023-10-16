import { FastifyReply, FastifyRequest } from 'fastify';
import { ReadInput, EditInput, AddInput, DeleteInput } from './shortcut.schema';
import ShortcutService from './shortcut.service';
import AccessService from '../sharing/access.service';
import { ItemEventType, triggerItemEvent } from '../item.event_handler';

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

			if (!(await this.accessService.hasAccessToItem(shortcut.id, request.user.sub))) {
				return reply.unauthorized();
			}

			return reply.code(200).send(shortcut);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
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

			if (!(await this.accessService.hasAccessToItem(shortcut.id, request.user.sub))) {
				return reply.unauthorized();
			}

			if (
				request.body.parentId !== null &&
				request.body.parentId !== undefined &&
				!(await this.accessService.hasAccessToItem(request.body.parentId, request.user.sub))
			) {
				return reply.unauthorized();
			}

			const updatedShortcut = await this.shortcutService.updateShortcut(request.body);

			triggerItemEvent(updatedShortcut, ItemEventType.UPDATE);

			return reply.code(200).send(updatedShortcut);
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
			if (
				request.body.parentId !== null &&
				request.body.parentId !== undefined &&
				!(await this.accessService.hasAccessToItem(request.body.parentId, request.user.sub))
			) {
				return reply.unauthorized();
			}

			const shortcut = await this.shortcutService.createShortcut({
				name: request.body.name,
				linkedItemId: request.body.linkedItemId,
				ownerId: request.user.sub,
				parentId: request.body.parentId ?? null,
			});

			triggerItemEvent(shortcut, ItemEventType.UPDATE);

			return reply.code(200).send(shortcut);
		} catch (e) {
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
			const shortcut = await this.shortcutService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItem(shortcut.id, request.user.sub))) {
				return reply.unauthorized();
			}

			await this.shortcutService.deleteShortcutByItemId(shortcut.id);

			triggerItemEvent(shortcut, ItemEventType.DELETE);

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
