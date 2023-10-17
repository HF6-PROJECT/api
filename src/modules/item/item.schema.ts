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

export type ItemPath = { id: number; name: string; parent?: ItemPath | null };

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

const itemBreadcrumbSchema = {
	$id: 'itemBreadcrumbSchema',
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

const itemBreadcrumbResponseSchema = {
	$id: 'itemBreadcrumbResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		name: {
			type: 'string',
		},
		parent: {
			type: ['object', 'null'],
			properties: {
				id: {
					type: 'number',
				},
				name: {
					type: 'string',
				},
				parent: { $ref: 'itemBreadcrumbResponseSchema' },
			},
		},
	},
} as const;

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
			linkedItemId: {
				type: ['number', 'null'],
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

const itemResponseSchema = {
	$id: 'itemResponseSchema',
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
		linkedItemId: {
			type: ['number', 'null'],
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
} as const;

const itemReadSchema = {
	$id: 'itemReadSchema',
	type: 'object',
	properties: {
		id: {
			type: 'string',
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

const itemSharingsSchema = {
	$id: 'itemSharingsSchema',
	type: 'object',
	properties: {
		id: {
			type: 'string',
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

const itemSharingsResponseSchema = {
	$id: 'itemSharingsResponseSchema',
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
		ownerId: {
			type: 'string',
		},
		parentId: {
			type: ['number', 'null'],
		},
		owner: {
			type: 'object',
			properties: {
				id: {
					type: 'number',
				},
				email: {
					type: 'string',
				},
				name: {
					type: 'string',
				},
				createdAt: {
					type: 'string',
				},
				updatedAt: {
					type: 'string',
				},
			},
		},
		ItemSharing: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'number',
					},
					userId: {
						type: 'number',
					},
					user: {
						type: 'object',
						properties: {
							id: {
								type: 'number',
							},
							email: {
								type: 'string',
							},
							name: {
								type: 'string',
							},
							createdAt: {
								type: 'string',
							},
							updatedAt: {
								type: 'string',
							},
						},
					},
					itemId: {
						type: 'number',
					},
					createdAt: {
						type: 'string',
					},
					updatedAt: {
						type: 'string',
					},
				},
			},
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

export type itemSharingsInput = FromSchema<typeof itemSharingsSchema>;
export type itemReadInput = FromSchema<typeof itemReadSchema>;
export type ReadInput = FromSchema<typeof readItemsSchema>;
export type itemBreadcrumbInput = FromSchema<typeof itemBreadcrumbSchema>;

export const itemSchemas = [
	itemBreadcrumbSchema,
	itemBreadcrumbResponseSchema,
	readItemsSchema,
	itemsResponseSchema,
	itemReadSchema,
	itemResponseSchema,
	itemSharingsSchema,
	itemSharingsResponseSchema,
];
