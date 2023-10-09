import { FromSchema } from 'json-schema-to-ts';
import { Item, UpdateItem } from '../item.schema';
import { ItemShortcut as prismaItemShortcutType } from '@prisma/client';

const readShortcutSchema = {
	$id: 'readShortcutSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'shortcut.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'shortcut.id.required',
		},
	},
} as const;

const readShortcutResponseSchema = {
	$id: 'readShortcutResponseSchema',
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

const editShortcutSchema = {
	$id: 'editShortcutSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'shortcut.id.type',
			},
		},
		name: {
			type: 'string',
			errorMessage: {
				type: 'shortcut.name.type',
			},
		},
		parentId: {
			type: ['number', 'null'],
			errorMessage: {
				type: 'shortcut.parentId.type',
			},
		},
	},
	required: ['id', 'name'],
	errorMessage: {
		required: {
			id: 'shortcut.id.required',
			name: 'shortcut.name.required',
		},
	},
} as const;

const editShortcutResponseSchema = {
	$id: 'editShortcutResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
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
const addShortcutSchema = {
	$id: 'addShortcutSchema',
	type: 'object',
	properties: {
		name: {
			type: 'string',
			errorMessage: {
				type: 'shortcut.name.type',
			},
		},
		linkedItemId: {
			type: 'number',
			errorMessage: {
				type: 'shortcut.linkedItemId.type',
			},
		},
		parentId: {
			type: ['number', 'null'],
			errorMessage: {
				type: 'shortcut.parentId.type',
			},
		},
	},
	required: ['name', 'linkedItemId'],
	errorMessage: {
		required: {
			name: 'shortcut.name.required',
			linkedItemId: 'shortcut.linkedItemId.required',
		},
	},
} as const;

const addShortcutResponseSchema = {
	$id: 'addShortcutResponseSchema',
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

const deleteShortcutSchema = {
	$id: 'deleteShortcutSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'shortcut.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			itemId: 'shortcut.id.required',
		},
	},
} as const;

export type AddInput = FromSchema<typeof addShortcutSchema>;
export type ReadInput = FromSchema<typeof readShortcutSchema>;
export type EditInput = FromSchema<typeof editShortcutSchema>;
export type DeleteInput = FromSchema<typeof deleteShortcutSchema>;

export type AddShortcut = {
	name: string;
	linkedItemId: number;
	ownerId: number;
	parentId: number | null;
};

export type ItemShortcut = prismaItemShortcutType & { shortcutItem: Item } & { linkedItem: Item };
export type Shortcut = Item;
export type UpdateShortcut = { id: number } & Partial<AddShortcut> & Omit<UpdateItem, 'mimeType'>;

export const shortcutSchemas = [
	addShortcutSchema,
	addShortcutResponseSchema,
	readShortcutSchema,
	readShortcutResponseSchema,
	editShortcutSchema,
	editShortcutResponseSchema,
	deleteShortcutSchema,
];
