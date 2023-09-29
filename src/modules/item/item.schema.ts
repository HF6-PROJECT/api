import { FromSchema } from 'json-schema-to-ts';

const uploadItemSchema = {
	$id: 'uploadItemSchema',
	type: 'object',
	properties: {
		type: {
			type: 'string',
			enum: ['blob.generate-client-token', 'blob.upload-completed'],
			errorMessage: {
				enum: 'blob.type.enum',
				type: 'blob.type.type',
			},
		},
		payload: {
			type: 'object',
			properties: {
				pathname: {
					type: 'string',
					errorMessage: {
						type: 'blob.payload.pathname.type',
					},
				},
				callbackUrl: {
					type: 'string',
					errorMessage: {
						type: 'blob.payload.callbackUrl.type',
					},
				},
				clientPayload: {
					type: 'string',
					errorMessage: {
						type: 'blob.payload.clientPayload.type',
					},
				},
				tokenPayload: {
					type: 'string',
					errorMessage: {
						type: 'blob.payload.tokenPayload.type',
					},
				},
				blob: {
					type: 'object',
					properties: {
						url: {
							type: 'string',
							errorMessage: {
								type: 'blob.payload.blob.url.type',
							},
						},
						pathname: {
							type: 'string',
							errorMessage: {
								type: 'blob.payload.blob.pathname.type',
							},
						},
						contentType: {
							type: 'string',
							errorMessage: {
								type: 'blob.payload.blob.contentType.type',
							},
						},
						contentDisposition: {
							type: 'string',
							errorMessage: {
								type: 'blob.payload.blob.contentDisposition.type',
							},
						},
					},
					required: ['url', 'pathname', 'contentType', 'contentDisposition'],
					errorMessage: {
						type: 'blob.payload.blob.type',
						required: {
							url: 'blob.payload.blob.url.required',
							pathname: 'blob.payload.blob.pathname.required',
							contentType: 'blob.payload.blob.contentType.required',
							contentDisposition: 'blob.payload.blob.contentDisposition.required',
						},
					},
				},
			},
			errorMessage: {
				type: 'blob.payload.type',
			},
		},
	},
	required: ['type', 'payload'],
	errorMessage: {
		required: {
			type: 'blob.type.required',
			payload: 'blob.payload.required',
		},
	},
} as const;

const uploadItemResponseSchema = {
	$id: 'uploadItemResponseSchema',
	type: 'object',
	properties: {
		type: {
			type: 'string',
			enum: ['blob.generate-client-token', 'blob.upload-completed'],
		},
		response: {
			type: 'string',
			enum: ['ok'],
		},
		clientToken: {
			type: 'string',
		},
	},
	required: ['type'],
} as const;

export type UploadInput = FromSchema<typeof uploadItemSchema>;

export type CreateItem = {
	name: string;
	mimeType: string;
	blobUrl: string;
	ownerId: number;
	parentId: number | null;
};

export const itemSchemas = [uploadItemSchema, uploadItemResponseSchema];
