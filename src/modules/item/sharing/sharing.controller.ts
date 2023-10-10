import { FastifyReply, FastifyRequest } from 'fastify';
import { AddInput, ReadInput, EditInput, DeleteInput } from './sharing.schema';
import SharingService from './sharing.service';
import AccessService from './access.service';

export default class SharingController {
	private sharingService: SharingService;
	private accessService: AccessService;

	constructor(sharingService: SharingService, accessService: AccessService) {
		this.sharingService = sharingService;
		this.accessService = accessService;
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const sharing = await this.sharingService.getById(request.params.id);

			if (!(await this.accessService.hasAccessToItem(sharing.itemId, request.user.sub))) {
				return reply.unauthorized();
			}

			return reply.code(200).send(sharing);
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
			const sharing = await this.sharingService.getById(request.body.id);

			if (!(await this.accessService.hasAccessToItem(sharing.itemId, request.user.sub))) {
				return reply.unauthorized();
			}

			const updatedSharing = await this.sharingService.updateSharing(request.body);

			return reply.code(200).send(updatedSharing);
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

			const sharing = await this.sharingService.createSharing(request.body, request.user.sub);

			return reply.code(200).send(sharing);
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
			const sharing = await this.sharingService.getById(request.params.id);

			if (!(await this.accessService.hasAccessToItem(sharing.itemId, request.user.sub))) {
				return reply.unauthorized();
			}

			await this.sharingService.deleteSharingByIdAndUserId(request.params.id, request.user.sub);

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
