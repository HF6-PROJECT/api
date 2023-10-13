import { FromSchema } from 'json-schema-to-ts';
import { ItemSharing as prismaItemSharingType } from '@prisma/client';

export type Sharing = prismaItemSharingType;

export type CreateSharing = {
	itemId: number;
	userId: number;
};
export type UpdateSharing = {
	itemId: number;
	userId: number;
} & Partial<CreateSharing>;
export type DeleteSharing = {
	itemId: number;
	userId: number;
};

const addSharingSchema = {
	$id: 'addSharingSchema',
	type: 'object',
	properties: {
		itemId: {
			type: 'number',
			errorMessage: {
				type: 'item.sharing.itemId.type',
			},
		},
		email: {
			type: 'string',
			format: 'email',
			errorMessage: {
				type: 'item.sharing.email.type',
				format: 'item.sharing.email.format',
			},
		},
	},
	required: ['itemId', 'email'],
	errorMessage: {
		required: {
			itemId: 'item.sharing.itemId.required',
			email: 'item.sharing.email.required',
		},
	},
} as const;
export type AddInput = FromSchema<typeof addSharingSchema>;

const addSharingResponseSchema = {
	$id: 'addSharingResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		itemId: {
			type: 'number',
		},
		userId: {
			type: 'number',
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
	},
} as const;

const readSharingSchema = {
	$id: 'readSharingSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'item.sharing.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'item.sharing.id.required',
		},
	},
} as const;
export type ReadInput = FromSchema<typeof readSharingSchema>;

const readSharingResponseSchema = {
	$id: 'readSharingResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		itemId: {
			type: 'number',
		},
		userId: {
			type: 'number',
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
	},
} as const;

const editSharingSchema = {
	$id: 'editSharingSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'item.sharing.id.type',
			},
		},
		itemId: {
			type: 'number',
			errorMessage: {
				type: 'item.sharing.itemId.type',
			},
		},
		userId: {
			type: 'number',
			errorMessage: {
				type: 'item.sharing.userId.type',
			},
		},
	},
	required: ['id', 'itemId', 'userId'],
	errorMessage: {
		required: {
			id: 'item.sharing.id.required',
			itemId: 'item.sharing.itemId.required',
			userId: 'item.sharing.userId.required',
		},
	},
} as const;
export type EditInput = FromSchema<typeof editSharingSchema>;

const editSharingResponseSchema = {
	$id: 'editSharingResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		itemId: {
			type: 'number',
		},
		userId: {
			type: 'number',
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
	},
} as const;

const deleteSharingSchema = {
	$id: 'deleteSharingSchema',
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
export type DeleteInput = FromSchema<typeof deleteSharingSchema>;

export const sharingSchemas = [
	addSharingSchema,
	addSharingResponseSchema,
	readSharingSchema,
	readSharingResponseSchema,
	editSharingSchema,
	editSharingResponseSchema,
	deleteSharingSchema,
];
