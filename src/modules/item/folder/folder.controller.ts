import { FastifyReply, FastifyRequest } from 'fastify';
import { ReadInput, EditInput, AddInput, DeleteInput } from './folder.schema';
import FolderService from './folder.service';
import AccessService from '../sharing/access.service';
import { ItemEventType, triggerItemEvent } from '../item.event';
import { UnauthorizedError, errorReply } from '../../../utils/error';

export default class FolderController {
	private folderService: FolderService;
	private accessService: AccessService;

	constructor(folderService: FolderService, accessService: AccessService) {
		this.folderService = folderService;
		this.accessService = accessService;
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const folder = await this.folderService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItem(folder.id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			return reply.code(200).send(folder);
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
			const folder = await this.folderService.getByItemId(request.body.id);

			if (!(await this.accessService.hasAccessToItem(folder.id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			if (
				request.body.parentId !== null &&
				request.body.parentId !== undefined &&
				!(await this.accessService.hasAccessToItem(request.body.parentId, request.user.sub))
			) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const updatedFolder = await this.folderService.updateFolder(request.body);

			await triggerItemEvent(updatedFolder, ItemEventType.UPDATE);

			return reply.code(200).send(updatedFolder);
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
				!(await this.accessService.hasAccessToItem(request.body.parentId, request.user.sub))
			) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const folder = await this.folderService.createFolder({
				name: request.body.name,
				color: request.body.color,
				ownerId: request.user.sub,
				parentId: request.body.parentId ?? null,
			});

			await triggerItemEvent(folder, ItemEventType.UPDATE);

			return reply.code(200).send(folder);
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
			const folder = await this.folderService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItem(folder.id, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			await this.folderService.deleteFolderByItemId(folder.id);

			await triggerItemEvent(folder, ItemEventType.DELETE);

			return reply.code(204).send();
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}
}
