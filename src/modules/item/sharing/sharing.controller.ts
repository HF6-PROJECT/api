import { FastifyReply, FastifyRequest } from 'fastify';
import { AddInput, ReadInput, EditInput, DeleteInput } from './sharing.schema';
import SharingService from './sharing.service';
import AccessService from './access.service';
import UserService from '../../auth/user.service';
import { UnauthorizedError, errorReply } from '../../../utils/error';

export default class SharingController {
	private sharingService: SharingService;
	private accessService: AccessService;
	private userService: UserService;

	constructor(
		sharingService: SharingService,
		accessService: AccessService,
		userService: UserService,
	) {
		this.sharingService = sharingService;
		this.accessService = accessService;
		this.userService = userService;
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
				throw new UnauthorizedError('error.unauthorized');
			}

			return reply.code(200).send(sharing);
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
			const sharing = await this.sharingService.getById(request.body.id);

			if (!(await this.accessService.hasAccessToItem(sharing.itemId, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const updatedSharing = await this.sharingService.updateSharing(request.body);

			return reply.code(200).send(updatedSharing);
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
			if (!(await this.accessService.hasAccessToItem(request.body.itemId, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			const user = await this.userService.getUserByEmail(request.body.email);

			const sharing = await this.sharingService.createSharing(
				{ userId: user.id, itemId: request.body.itemId },
				request.user.sub,
			);

			return reply.code(200).send(sharing);
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
			const sharing = await this.sharingService.getById(request.params.id);

			if (!(await this.accessService.hasAccessToItem(sharing.itemId, request.user.sub))) {
				throw new UnauthorizedError('error.unauthorized');
			}

			await this.sharingService.deleteSharingByIdAndUserId(request.params.id, request.user.sub);

			return reply.code(204).send();
		} catch (e) {
			return errorReply(request, reply, e);
		}
	}
}
