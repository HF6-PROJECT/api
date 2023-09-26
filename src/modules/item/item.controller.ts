import { FastifyReply, FastifyRequest } from 'fastify';
import { UploadInput } from './item.schema';
import BlobService from './blob.service';
import ItemService from './item.service';

export default class ItemController {
	private itemService: ItemService;
	private blobService: BlobService;

	constructor(itemService: ItemService, blobService: BlobService) {
		this.blobService = blobService;
		this.itemService = itemService;
	}

	public async uploadHandler(
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

						await this.itemService.createItem({
							name: blob.pathname,
							mimeType: blob.contentType,
							blobUrl: blob.url,
							ownerId: tokenPayloadObject.ownerId,
							parentId: tokenPayloadObject.parentId ?? null,
						});
					} catch (e) {
						request.log.error(e);
						await this.blobService.deleteBlob(blob.url);
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
}
