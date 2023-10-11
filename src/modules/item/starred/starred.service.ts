import { prisma } from '../../../plugins/prisma';
import { Starred, AddStarred } from './starred.schema';

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
			});

			return itemStarred;
		}
	}

	public async getByItemIdAndUserId(itemId: number, userId: number): Promise<Starred> {
		const itemStarred = await prisma.itemStarred.findUnique({
			where: {
				itemId_userId: {
					itemId: itemId,
					userId: userId,
				},
			},
		});

		if (!itemStarred) {
			throw new Error('item.starred.notFound');
		}

		return itemStarred;
	}

	public async deleteStarredById(id: number): Promise<void> {
		await prisma.item.delete({
			where: {
				id: id,
			},
		});
	}
}
