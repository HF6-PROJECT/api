import { FromSchema } from 'json-schema-to-ts';
import { Item, UpdateItem } from '../item.schema';
import { ItemDocs as prismaItemDocsType } from '@prisma/client';

const readDocsSchema = {
	$id: 'readDocsSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'docs.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'docs.id.required',
		},
	},
} as const;

const readDocsResponseSchema = {
	$id: 'readDocsResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		text: {
			type: 'string',
		},
		parentId: {
			type: ['number', 'null'],
		},
		name: {
			type: 'string',
		},
		mimeType: {
			type: 'string',
		},
		ownerId: {
			type: 'number',
		},
		deletedAt: {
			type: ['string', 'null'],
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
	},
} as const;

const editDocsSchema = {
	$id: 'editDocsSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'docs.id.type',
			},
		},
		name: {
			type: 'string',
			errorMessage: {
				type: 'docs.name.type',
			},
		},
		text: {
			type: 'string',
			errorMessage: {
				type: 'docs.text.type',
			},
		},
		parentId: {
			type: ['number', 'null'],
			errorMessage: {
				type: 'docs.parentId.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'docs.id.required',
		},
	},
} as const;

const editDocsResponseSchema = {
	$id: 'editDocsResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		text: {
			type: 'string',
		},
		parentId: {
			type: ['number', 'null'],
		},
		name: {
			type: 'string',
		},
		mimeType: {
			type: 'string',
		},
		ownerId: {
			type: 'number',
		},
		deletedAt: {
			type: ['string', 'null'],
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
	},
} as const;

const addDocsSchema = {
	$id: 'addDocsSchema',
	type: 'object',
	properties: {
		name: {
			type: 'string',
			errorMessage: {
				type: 'docs.name.type',
			},
		},
		text: {
			type: 'string',
			errorMessage: {
				type: 'docs.text.type',
			},
		},
		parentId: {
			type: ['number', 'null'],
			errorMessage: {
				type: 'docs.parentId.type',
			},
		},
	},
	required: ['name', 'text'],
	errorMessage: {
		required: {
			name: 'docs.name.required',
			text: 'docs.text.required',
		},
	},
} as const;

const addDocsResponseSchema = {
	$id: 'addDocsResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		name: {
			type: 'string',
		},
		text: {
			type: 'string',
		},
		parentId: {
			type: ['number', 'null'],
		},
		mimeType: {
			type: 'string',
		},
		ownerId: {
			type: 'number',
		},
		deletedAt: {
			type: ['string', 'null'],
		},
		createdAt: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
		},
	},
} as const;

const deleteDocsSchema = {
	$id: 'deleteDocsSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'docs.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			itemId: 'docs.id.required',
		},
	},
} as const;

export type AddInput = FromSchema<typeof addDocsSchema>;
export type ReadInput = FromSchema<typeof readDocsSchema>;
export type EditInput = FromSchema<typeof editDocsSchema>;
export type DeleteInput = FromSchema<typeof deleteDocsSchema>;

export type AddDocs = {
	name: string;
	text: string;
	ownerId: number;
	parentId: number | null;
};

export type ItemDocs = prismaItemDocsType & { item: Item };
export type Docs = Omit<prismaItemDocsType, 'id' | 'itemId'> & Item;
export type UpdateDocs = { id: number } & Partial<AddDocs> & Omit<UpdateItem, 'mimeType'>;

export const docsSchemas = [
	addDocsSchema,
	addDocsResponseSchema,
	readDocsSchema,
	readDocsResponseSchema,
	editDocsSchema,
	editDocsResponseSchema,
	deleteDocsSchema,
];
