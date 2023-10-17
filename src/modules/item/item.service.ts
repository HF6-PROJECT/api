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
				ItemDocs: true,
				ItemShortcut: true,
				ItemStarred: {
					where: {
						userId: ownerId,
					},
				},
			},
		});

		return this.formatItems(items);
	}

	public async getAllOwnedAndSharredItemsByParentIdAndUserIdRecursively(
		userId: number,
		parentId: number | null,
	): Promise<ItemWithProperties[]> {
		const returnItems = [];

		const items = await this.getAllOwnedAndSharredItemsByParentIdAndUserId(userId, parentId);
		returnItems.push(...items);

		await Promise.all(
			items.map(async (item) => {
				if (item.mimeType !== 'application/vnd.cloudstore.folder') {
					return;
				}

				const childItems = await this.getAllOwnedAndSharredItemsByParentIdAndUserId(
					userId,
					item.id,
				);
				returnItems.push(...childItems);
			}),
		);

		return returnItems;
	}

	public async getStarredItemsByUserId(userId: number): Promise<ItemWithProperties[]> {
		const items = await prisma.item.findMany({
			where: {
				ItemStarred: {
					some: {
						userId: userId,
					},
				},
			},
			include: {
				ItemBlob: true,
				ItemFolder: true,
				ItemDocs: true,
				ItemShortcut: true,
				ItemStarred: {
					where: {
						userId: userId,
					},
				},
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
				ItemDocs: true,
				ItemShortcut: true,
				ItemStarred: {
					where: {
						userId: userId,
					},
				},
			},
		});

		return this.formatItems(items);
	}

	public async getAllSharedItemsByUserId(userId: number) {
		const items = await prisma.item.findMany({
			where: {
				ItemSharing: {
					some: {
						userId: userId,
					},
				},
				ownerId: {
					not: userId,
				},
			},
			include: {
				ItemBlob: true,
				ItemFolder: true,
				ItemDocs: true,
				ItemShortcut: true,
				ItemStarred: {
					where: {
						userId: userId,
					},
				},
			},
		});

		return this.formatItems(items);
	}

	public async getItemByIdWithSharingsAndOwner(id: number) {
		const item = await prisma.item.findUnique({
			where: {
				id,
			},
			include: {
				owner: true,
				ItemSharing: {
					include: {
						user: true,
					},
				},
			},
		});

		if (!item) {
			throw new Error('item.notFound');
		}

		return item;
	}

	public async getItemByIdWithInclude(id: number, userId: number): Promise<ItemWithProperties> {
		const item = await prisma.item.findUnique({
			where: {
				id,
			},
			include: {
				ItemBlob: true,
				ItemFolder: true,
				ItemDocs: true,
				ItemShortcut: true,
				ItemStarred: {
					where: {
						userId: userId,
					},
				},
			},
		});

		if (!item) {
			throw new Error('item.notFound');
		}

		return this.formatItem(item);
	}

	private formatItem(item: ItemPrismaProperties): ItemWithProperties {
		const { ItemFolder, ItemBlob, ItemDocs, ItemShortcut, ItemStarred, ...strippedElement } = item;

		return {
			...ItemBlob,
			...ItemFolder,
			...ItemDocs,
			...ItemShortcut,
			...strippedElement,
			isStarred: ItemStarred.length > 0,
		};
	}

	private formatItems(items: ItemPrismaProperties[]): ItemWithProperties[] {
		return items.map((element) => {
			return this.formatItem(element);
		});
	}
}
