import { FastifyReply, FastifyRequest } from 'fastify';
import { ReadInput, EditInput, AddInput, DeleteInput } from './folder.schema';
import FolderService from './folder.service';

export default class ItemController {
	private folderService: FolderService;

	constructor(folderService: FolderService) {
		this.folderService = folderService;
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const folder = await this.folderService.getByItemId(request.params.id);

			if (folder.ownerId !== request.user.sub) {
				return reply.unauthorized();
			}

			return reply.code(200).send(folder);
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
			const folder = await this.folderService.getByItemId(request.body.id);

			if (folder.ownerId !== request.user.sub) {
				return reply.unauthorized();
			}

			const updatedFolder = await this.folderService.updateFolder(request.body);

			return reply.code(200).send(updatedFolder);
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
			const folder = await this.folderService.createFolder({
				name: request.body.name,
				mimeType: 'application/vnd.cloudstore.folder',
				color: request.body.color,
				ownerId: request.user.sub,
				parentId: request.body.parentId ?? null,
			});

			return reply.code(200).send(folder);
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
			const folder = await this.folderService.getByItemId(request.params.id);

			if (folder.ownerId !== request.user.sub) {
				return reply.unauthorized();
			}

			await this.folderService.deleteFolderByItemId(request.params.id);
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(request.i18n.t(e.message));
			}

			/* istanbul ignore next */
			return reply.badRequest();
		}
	}
}
