import { Item as prismaItemType } from '@prisma/client';

export type Item = prismaItemType;

export type CreateItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export type UpdateItem = Pick<Item, 'id'> & Partial<CreateItem>;
