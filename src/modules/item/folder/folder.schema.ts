import { FromSchema } from 'json-schema-to-ts';
import { Item, UpdateItem } from '../item.schema';
import { ItemFolder as prismaItemFolderType } from '@prisma/client';

const readFolderSchema = {
	$id: 'readFolderSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'folder.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'folder.id.required',
		},
	},
} as const;

const readFolderResponseSchema = {
	$id: 'readFolderResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		color: {
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

const editFolderSchema = {
	$id: 'editFolderSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'folder.id.type',
			},
		},
		name: {
			type: 'string',
			errorMessage: {
				type: 'folder.name.type',
			},
		},
		color: {
			type: 'string',
			errorMessage: {
				type: 'folder.color.type',
			},
		},
		parentId: {
			type: ['number', 'null'],
			errorMessage: {
				type: 'folder.itemid.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'folder.id.required',
		},
	},
} as const;

const editFolderResponseSchema = {
	$id: 'editFolderResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		color: {
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
const addFolderSchema = {
	$id: 'addFolderSchema',
	type: 'object',
	properties: {
		name: {
			type: 'string',
			errorMessage: {
				type: 'folder.name.type',
			},
		},
		color: {
			type: 'string',
			errorMessage: {
				type: 'folder.color.type',
			},
		},
		parentId: {
			type: ['number', 'null'],
			errorMessage: {
				type: 'folder.itemid.type',
			},
		},
	},
	required: ['name', 'color'],
	errorMessage: {
		required: {
			name: 'folder.name.required',
			color: 'folder.color.required',
		},
	},
} as const;

const addFolderResponseSchema = {
	$id: 'addFolderResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		name: {
			type: 'string',
		},
		color: {
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

const deleteFolderSchema = {
	$id: 'deleteFolderSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'folder.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			itemId: 'folder.id.required',
		},
	},
} as const;

export type AddInput = FromSchema<typeof addFolderSchema>;
export type ReadInput = FromSchema<typeof readFolderSchema>;
export type EditInput = FromSchema<typeof editFolderSchema>;
export type DeleteInput = FromSchema<typeof deleteFolderSchema>;

export type AddFolder = {
	name: string;
	color: string;
	mimeType: string;
	ownerId: number;
	parentId: number | null;
};

export type ItemFolder = prismaItemFolderType & { item: Item };
export type Folder = Omit<prismaItemFolderType, 'id' | 'itemId'> & Item;
export type UpdateFolder = { id: number } & Partial<AddFolder> & UpdateItem;

export const folderSchemas = [
	addFolderSchema,
	addFolderResponseSchema,
	readFolderSchema,
	readFolderResponseSchema,
	editFolderSchema,
	editFolderResponseSchema,
	deleteFolderSchema,
];
