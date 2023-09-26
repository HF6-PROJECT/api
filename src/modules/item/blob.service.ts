import { HeadBlobResult, PutBlobResult, del, head } from '@vercel/blob';
import { HandleUploadBody, handleUpload } from '@vercel/blob/client';
import { accessTokenPayload, jwt } from '../../plugins/jwt';
import { FastifyRequest } from 'fastify';

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
	/* istanbul ignore next */
	public async deleteBlob(url: string | string[]): Promise<void> {
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
					throw new Error('Unauthorized');
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
