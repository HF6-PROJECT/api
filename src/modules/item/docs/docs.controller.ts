import { FastifyReply, FastifyRequest } from 'fastify';
import { ReadInput, EditInput, AddInput, DeleteInput } from './docs.schema';
import DocsService from './docs.service';
import AccessService from '../sharing/access.service';
import { ItemEventType, triggerItemEvent } from '../item.event';
import { UnauthorizedError, errorReply } from '../../../utils/error';

export default class DocsController {
	private docsService: DocsService;
	private accessService: AccessService;

	constructor(docsService: DocsService, accessService: AccessService) {
		this.docsService = docsService;
		this.accessService = accessService;
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const docs = await this.docsService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItem(docs, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			return reply.code(200).send(docs);
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
			const docs = await this.docsService.getByItemId(request.body.id);

			if (!(await this.accessService.hasAccessToItem(docs, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const updatedDocs = await this.docsService.updateDocs(request.body);

			await triggerItemEvent(updatedDocs, ItemEventType.UPDATE);

			return reply.code(200).send(updatedDocs);
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

			const docs = await this.docsService.createDocs({
				name: request.body.name,
				text: request.body.text,
				ownerId: request.user.sub,
				parentId: request.body.parentId ?? null,
			});

			await triggerItemEvent(docs, ItemEventType.UPDATE);

			return reply.code(200).send(docs);
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
			const docs = await this.docsService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItem(docs, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			await this.docsService.deleteDocsByItemId(docs.id);

			await triggerItemEvent(docs, ItemEventType.DELETE);

			return reply.code(204).send();
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}
}
