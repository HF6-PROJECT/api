import { prisma } from '../../plugins/prisma';
import { CreateItem, Item, ItemPrismaProperties, ItemWithProperties } from './item.schema';

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

	public async getByOwnerIdAndParentId(
		ownerId: number,
		parentId: number | null,
	): Promise<ItemWithProperties[]> {
		const items = await prisma.item.findMany({
			where: {
				parentId: parentId,
				ownerId: ownerId,
			},
			include: {
				ItemBlob: true,
				ItemFolder: true,
				ItemShortcut: true,
			},
		});

		return this.formatItems(items);
	}

	public async getAllOwnedAndSharredItemsByParentIdAndUserId(
		userId: number,
		parentId: number | null,
	): Promise<ItemWithProperties[]> {
		const items = await prisma.item.findMany({
			where: {
				parentId: parentId,
				OR: [
					{
						ownerId: userId,
					},
					{
						ItemSharing: {
							some: {
								userId: userId,
							},
						},
					},
				],
			},
			include: {
				ItemBlob: true,
				ItemFolder: true,
				ItemShortcut: true,
			},
		});

		return this.formatItems(items);
	}

	private formatItems(items: ItemPrismaProperties[]): ItemWithProperties[] {
		return items.map((element) => {
			const { ItemFolder, ItemBlob, ItemShortcut, ...strippedElement } = element;

			return {
				...ItemBlob,
				...ItemFolder,
				...ItemShortcut,
				...strippedElement,
			};
		});
	}
}
