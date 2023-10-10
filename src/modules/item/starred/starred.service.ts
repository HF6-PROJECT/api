import { prisma } from '../../../plugins/prisma';
import { Starred, AddStarred, ItemStarred } from './starred.schema';

export default class StarredService {
	public async createStarred(input: AddStarred): Promise<Starred> {
		try {
			await this.getByItemIdAndUserId(input.itemId, input.userId);

			throw new Error('item.starred.alreadyExists');
		} catch (e) {
			if (e instanceof Error && e.message === 'item.starred.alreadyExists') {
				throw e;
			}

			const itemStarred = await prisma.itemStarred.create({
				data: {
					item: {
						connect: {
							id: input.itemId,
						},
					},
					user: {
						connect: {
							id: input.userId,
						},
					},
				},
				include: {
					item: true,
				},
			});

			return this.formatItemStarred(itemStarred);
		}
	}

	public async getById(id: number): Promise<Starred> {
		const itemStarred = await prisma.itemStarred.findUnique({
			where: {
				id,
			},
			include: {
				item: true,
			},
		});

		if (!itemStarred) {
			throw new Error('item.starred.notFound');
		}

		return this.formatItemStarred(itemStarred);
	}

	public async getByUserId(userId: number): Promise<Starred[]> {
		const itemStarred = await prisma.itemStarred.findMany({
			where: {
				userId: userId,
			},
			include: {
				item: true,
			},
		});

		return this.formatItemsStarred(itemStarred);
	}

	public async getByItemIdAndUserId(itemId: number, userId: number): Promise<Starred> {
		const itemStarred = await prisma.itemStarred.findUnique({
			where: {
				itemId_userId: {
					itemId: itemId,
					userId: userId,
				},
			},
			include: {
				item: true,
			},
		});

		if (!itemStarred) {
			throw new Error('item.starred.notFound');
		}

		return this.formatItemStarred(itemStarred);
	}

	public async deleteStarredById(id: number): Promise<void> {
		await prisma.item.delete({
			where: {
				id: id,
			},
		});
	}

	private formatItemsStarred(itemStarred: ItemStarred[]): Starred[] {
		return itemStarred.map((element) => {
			const { item, ...strippedElement } = element;

			return {
				...item,
				...strippedElement,
			};
		});
	}

	private formatItemStarred(itemStarred: ItemStarred): Starred {
		return {
			...itemStarred.item,
			id: itemStarred.id,
			itemId: itemStarred.itemId,
			userId: itemStarred.userId,
		};
	}
}
