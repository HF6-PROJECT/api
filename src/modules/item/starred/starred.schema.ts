import { FromSchema } from 'json-schema-to-ts';
import { Item } from '../item.schema';
import { ItemStarred as prismaItemStarredType } from '@prisma/client';

const addStarredSchema = {
	$id: 'addStarredSchema',
	type: 'object',
	properties: {
		itemId: {
			type: 'number',
			errorMessage: {
				type: 'starred.itemId.type',
			},
		},
	},
	required: ['itemId'],
	errorMessage: {
		required: {
			itemId: 'starred.itemId.required',
		},
	},
} as const;

const addStarredResponseSchema = {
	$id: 'addStarredResponseSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
		},
		userId: {
			type: 'number',
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
} as const;

const deleteStarredSchema = {
	$id: 'deleteStarredSchema',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			errorMessage: {
				type: 'starred.id.type',
			},
		},
	},
	required: ['id'],
	errorMessage: {
		required: {
			id: 'starred.id.required',
		},
	},
} as const;

export type AddInput = FromSchema<typeof addStarredSchema>;
export type DeleteInput = FromSchema<typeof deleteStarredSchema>;

export type AddStarred = {
	itemId: number;
	userId: number;
};

export type ItemStarred = prismaItemStarredType & { item: Item };
export type Starred = prismaItemStarredType;

export const starredSchemas = [addStarredSchema, addStarredResponseSchema, deleteStarredSchema];
