import {
	Item as prismaItemType,
	ItemBlob as prismaItemBlobType,
	ItemFolder as prismaItemFolderType,
	ItemDocs as prismaItemDocsType,
	ItemShortcut as prismaItemShortcutType,
	ItemStarred as prismaItemStarredType,
} from '@prisma/client';
import { FromSchema } from 'json-schema-to-ts';

export type Item = prismaItemType;

export type ItemPrismaProperties = Item & { ItemBlob: prismaItemBlobType | null } & {
	ItemFolder: prismaItemFolderType | null;
} & { ItemDocs: prismaItemDocsType | null } & { ItemShortcut: prismaItemShortcutType | null } & {
	ItemStarred: prismaItemStarredType[];
};

export type ItemWithProperties = Item &
	Omit<Partial<prismaItemBlobType>, 'id' | 'itemId'> &
	Omit<Partial<prismaItemFolderType>, 'id' | 'itemId'> &
	Omit<Partial<prismaItemDocsType>, 'id' | 'itemId'> &
	Omit<Partial<prismaItemShortcutType>, 'id' | 'itemId'> & { isStarred: boolean };

export type CreateItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export type UpdateItem = Pick<Item, 'id'> & Partial<CreateItem>;

const readItemsSchema = {
	$id: 'readItemsSchema',
	type: 'object',
	properties: {
		parentId: {
			type: 'number',
			errorMessage: {
				type: 'item.parentId.type',
			},
		},
	},
	required: ['parentId'],
	errorMessage: {
		required: {
			id: 'item.parentId.required',
		},
	},
} as const;

const itemsResponseSchema = {
	$id: 'itemsResponseSchema',
	type: 'array',
	items: {
		type: 'object',
		properties: {
			id: {
				type: 'number',
			},
			name: {
				type: 'string',
			},
			color: {
				type: ['string', 'null'],
			},
			text: {
				type: ['string', 'null'],
			},
			blobUrl: {
				type: ['string', 'null'],
			},
			parentId: {
				type: ['number', 'null'],
			},
			isStarred: {
				type: 'boolean',
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
	},
} as const;

export type ReadInput = FromSchema<typeof readItemsSchema>;

export const itemSchemas = [readItemsSchema, itemsResponseSchema];
