import { FromSchema } from 'json-schema-to-ts';
import { Item, UpdateItem } from '../item.schema';
import { ItemBlob as prismaItemBlobType } from '@prisma/client';

export type ItemBlob = prismaItemBlobType & { item: Item };
export type Blob = Omit<prismaItemBlobType, 'id' | 'itemId'> & Item;

export type CreateBlob = {
	name: string;
	mimeType: string;
	blobUrl: string;
	ownerId: number;
	parentId: number | null;
};
export type UpdateBlob = { id: number } & Partial<CreateBlob> & UpdateItem;

const uploadBlobSchema = {
	$id: 'uploadBlobSchema',
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
export type UploadInput = FromSchema<typeof uploadBlobSchema>;

const uploadBlobResponseSchema = {
	$id: 'uploadBlobResponseSchema',
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

const readBlobSchema = {
	$id: 'readBlobSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'item.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'item.id.required',
		},
	},
} as const;
export type ReadInput = FromSchema<typeof readBlobSchema>;

const readBlobResponseSchema = {
	$id: 'readBlobResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		name: {
			type: 'string',
		},
		mimeType: {
			type: 'string',
		},
		blobUrl: {
			type: 'string',
		},
		ownerId: {
			type: 'number',
		},
		parentId: {
			type: ['number', 'null'],
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
		deletedAt: {
			type: ['string', 'null'],
		},
	},
} as const;

const editBlobSchema = {
	$id: 'editBlobSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'item.id.type',
			},
		},
		name: {
			type: 'string',
		},
		parentId: {
			type: ['number', 'null'],
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'item.id.required',
		},
	},
} as const;
export type EditInput = FromSchema<typeof editBlobSchema>;

const editBlobResponseSchema = {
	$id: 'editBlobResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		name: {
			type: 'string',
		},
		mimeType: {
			type: 'string',
		},
		blobUrl: {
			type: 'string',
		},
		ownerId: {
			type: 'number',
		},
		parentId: {
			type: ['number', 'null'],
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
		deletedAt: {
			type: ['string', 'null'],
		},
	},
} as const;

const deleteBlobSchema = {
	$id: 'deleteBlobSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'item.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'item.id.required',
		},
	},
} as const;
export type DeleteInput = FromSchema<typeof deleteBlobSchema>;

export const blobSchemas = [
	uploadBlobSchema,
	uploadBlobResponseSchema,
	readBlobSchema,
	readBlobResponseSchema,
	editBlobSchema,
	editBlobResponseSchema,
	deleteBlobSchema,
];
