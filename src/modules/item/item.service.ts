import { prisma } from '../../plugins/prisma';
import { CreateItem, Item } from './item.schema';

export default class ItemService {
	public async getById(id: number): Promise<Item> {
		const item = await prisma.item.findUnique({
			where: {
				id,
			},
		});

		if (!item) {
			throw new Error('item.notFound');
		}

		return item;
	}

	public async createItem(input: CreateItem): Promise<Item> {
		const item = await prisma.item.create({
			data: {
				name: input.name,
				mimeType: input.mimeType,
				ownerId: input.ownerId,
				parentId: input.parentId,
			},
		});

		return item;
	}
}
