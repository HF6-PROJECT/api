import { FastifyReply, FastifyRequest } from 'fastify';
import { UploadInput, ReadInput, EditInput, DeleteInput } from './blob.schema';
import BlobService from './blob.service';
import AccessService from '../sharing/access.service';
import { ItemEventType, triggerItemEvent } from '../item.event_handler';

export default class BlobController {
	private blobService: BlobService;
	private accessService: AccessService;

	constructor(blobService: BlobService, accessService: AccessService) {
		this.blobService = blobService;
		this.accessService = accessService;
	}

	public async readHandler(
		request: FastifyRequest<{
			Params: ReadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const blob = await this.blobService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItem(blob.id, request.user.sub))) {
				return reply.unauthorized();
			}

			return reply.code(200).send(blob);
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
			const blob = await this.blobService.getByItemId(request.body.id);

			if (!(await this.accessService.hasAccessToItem(blob.id, request.user.sub))) {
				return reply.unauthorized();
			}

			const updatedBlob = await this.blobService.updateBlob(request.body);

			triggerItemEvent(updatedBlob, ItemEventType.UPDATE);

			return reply.code(200).send(updatedBlob);
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
			Body: UploadInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const jsonResponse = await this.blobService.handleUpload(
				request,
				['text/plain'],
				/* istanbul ignore next */ // Sadly this is not testable, beacuse the function is normally called by the blob service, with generated data
				async ({ blob, tokenPayload }) => {
					try {
						if (!tokenPayload) {
							request.log.error(
								"Vercel blob storage didn't pass a token payload!",
								blob,
								tokenPayload,
							);
							throw new Error('Unauthorized');
						}

						const tokenPayloadObject = JSON.parse(tokenPayload);
						if (!tokenPayloadObject.ownerId) {
							request.log.error(
								"Vercel blob storage didn't pass a valid token payload! ownerId is missing!",
								blob,
								tokenPayload,
							);
							throw new Error('Unauthorized');
						}

						const createdBlob = await this.blobService.createBlob({
							name: blob.pathname,
							mimeType: blob.contentType,
							blobUrl: blob.url,
							ownerId: tokenPayloadObject.ownerId,
							parentId: tokenPayloadObject.parentId ?? null,
						});

						triggerItemEvent(createdBlob, ItemEventType.UPDATE);
					} catch (e) {
						request.log.error(e);
						await this.blobService.deleteBlobByUrl(blob.url);
					}
				},
				async (clientPayload, accessTokenPayload) => {
					if (!clientPayload) {
						throw new Error(request.i18n.t('item.upload.clientPayload.required'));
					}

					const clientPayloadObject = JSON.parse(clientPayload);
					if (clientPayloadObject.parentId === undefined) {
						throw new Error(request.i18n.t('item.upload.clientPayload.parentId.required'));
					}

					if (
						clientPayloadObject.parentId !== null &&
						!(await this.accessService.hasAccessToItem(
							clientPayloadObject.parentId,
							accessTokenPayload.sub,
						))
					) {
						throw new Error('Unauthorized');
					}

					return JSON.stringify({
						parentId: clientPayloadObject.parentId,
						ownerId: accessTokenPayload.sub,
					});
				},
			);

			return reply.code(200).send(jsonResponse);
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Unauthorized') {
					return reply.unauthorized();
				}

				return reply.badRequest(e.message);
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
			const blob = await this.blobService.getByItemId(request.params.id);

			if (!(await this.accessService.hasAccessToItem(blob.id, request.user.sub))) {
				return reply.unauthorized();
			}

			await this.blobService.deleteBlobByItemId(blob.id);

			triggerItemEvent(blob, ItemEventType.DELETE);

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
