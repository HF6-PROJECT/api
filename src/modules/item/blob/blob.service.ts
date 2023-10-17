import { HeadBlobResult, PutBlobResult, del, head } from '@vercel/blob';
import { HandleUploadBody, handleUpload } from '@vercel/blob/client';
import { accessTokenPayload, jwt } from '../../../plugins/jwt';
import { FastifyRequest } from 'fastify';
import { prisma } from '../../../plugins/prisma';
import { Blob, CreateBlob, UpdateBlob, ItemBlob } from './blob.schema';
import SharingService from '../sharing/sharing.service';
import { MissingError, UnauthorizedError } from '../../../utils/error';

type OnUploadCompletedCallback = (body: {
	blob: PutBlobResult;
	tokenPayload?: string | undefined;
}) => Promise<void>;

type FormatTokenPayloadCallback = (
	clientPayload: string | undefined,
	accessTokenPayload: accessTokenPayload,
) => FormatTokenPayloadCallbackReturn;
type FormatTokenPayloadCallbackReturn = string | undefined | Promise<string | undefined>;

type BlobGenerateTokenResponse = {
	type: 'blob.generate-client-token';
	clientToken: string;
};
type BlobUploadedCompletedResponse = {
	type: 'blob.upload-completed';
	response: 'ok';
};

export default class BlobService {
	private sharingService: SharingService;

	constructor(sharingService: SharingService) {
		this.sharingService = sharingService;
	}

	private formatItemBlob(itemBlob: ItemBlob): Blob {
		return {
			blobUrl: itemBlob.blobUrl,
			...itemBlob.item,
		};
	}

	public async getByItemId(itemId: number): Promise<Blob> {
		const itemBlob = await prisma.itemBlob.findUnique({
			where: {
				itemId,
			},
			include: {
				item: true,
			},
		});

		if (!itemBlob) {
			throw new MissingError('item.blob.notFound');
		}

		return this.formatItemBlob(itemBlob);
	}

	public async createBlob(input: CreateBlob): Promise<Blob> {
		const itemBlob = await prisma.itemBlob.create({
			data: {
				blobUrl: input.blobUrl,
				item: {
					create: {
						name: input.name,
						mimeType: input.mimeType,
						ownerId: input.ownerId,
						parentId: input.parentId,
					},
				},
			},
			include: {
				item: true,
			},
		});

		if (input.parentId) {
			await this.sharingService.syncSharingsByItemId(input.parentId, itemBlob.item.id);
		}

		return this.formatItemBlob(itemBlob);
	}

	public async updateBlob(input: UpdateBlob): Promise<Blob> {
		const itemBlob = await prisma.itemBlob.update({
			data: {
				item: {
					update: {
						name: input.name,
						parentId: input.parentId,
					},
				},
			},
			where: {
				itemId: input.id,
			},
			include: {
				item: true,
			},
		});

		return this.formatItemBlob(itemBlob);
	}

	public async deleteBlobByItemId(itemId: number): Promise<void> {
		const itemBlob = await prisma.item.delete({
			where: {
				id: itemId,
			},
			include: {
				ItemBlob: true,
			},
		});

		/* istanbul ignore next */
		if (!itemBlob.ItemBlob) {
			return;
		}

		try {
			await this.deleteBlobByUrl(itemBlob.ItemBlob.blobUrl);
		} catch (e) {
			// Do nothing
		}
	}

	public async deleteBlobByUrl(url: string | string[]): Promise<void> {
		await del(url);
	}

	/* istanbul ignore next */
	public async getBlobMetaData(url: string): Promise<HeadBlobResult | null> {
		return await head(url);
	}

	public async handleUpload(
		request: FastifyRequest,
		allowedContentTypes: string[],
		onUploadCompleted: OnUploadCompletedCallback,
		formatTokenPayload?: FormatTokenPayloadCallback,
	): Promise<BlobGenerateTokenResponse | BlobUploadedCompletedResponse> {
		return await handleUpload({
			body: request.body as HandleUploadBody,
			request: request.raw,
			onBeforeGenerateToken: async (pathname, clientPayload) => {
				const accessToken =
					request.headers.authorization?.replace('Bearer ', '') ?? /* istanbul ignore next */ '';

				// You should not be able to upload files without being signed in
				try {
					jwt.verify(accessToken);
				} catch (error) {
					throw new UnauthorizedError('error.unauthorized');
				}

				const accessTokenPayload = jwt.decodeAccessToken(accessToken);

				return {
					allowedContentTypes,
					// Use the provided formatTokenPayload callback to format the token payload. If no callback is provided, the token payload will be undefined.
					tokenPayload: formatTokenPayload
						? await formatTokenPayload(clientPayload, accessTokenPayload)
						: undefined,
				};
			},
			onUploadCompleted,
		});
	}
}
