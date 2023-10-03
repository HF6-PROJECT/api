import { prisma } from '../../../plugins/prisma';
import { Sharing, CreateSharing, UpdateSharing } from './sharing.schema';

export default class SharingService {
	public async getById(id: number): Promise<Sharing> {
		const itemSharing = await prisma.itemSharing.findUnique({
			where: {
				id,
			},
		});

		if (!itemSharing) {
			throw new Error('item.sharing.notFound');
		}

		return itemSharing;
	}

	public async getByItemIdAndUserId(itemId: number, userId: number): Promise<Sharing> {
		const itemSharing = await prisma.itemSharing.findUnique({
			where: {
				itemId_userId: {
					itemId: itemId,
					userId: userId,
				},
			},
		});

		if (!itemSharing) {
			throw new Error('item.sharing.notFound');
		}

		return itemSharing;
	}

	public async createSharing(input: CreateSharing): Promise<Sharing> {
		try {
			await this.getByItemIdAndUserId(input.itemId, input.userId);

			throw new Error('item.sharing.alreadyExists');
		} catch (e) {
			if (e instanceof Error && e.message === 'item.sharing.alreadyExists') {
				throw e;
			}

			const itemSharing = await prisma.itemSharing.create({
				data: {
					itemId: input.itemId,
					userId: input.userId,
				},
			});

			return itemSharing;
		}
	}

	public async updateSharing(input: UpdateSharing): Promise<Sharing> {
		const itemSharing = await prisma.itemSharing.update({
			data: {
				// Nothing to update yet
			},
			where: {
				itemId_userId: {
					itemId: input.itemId,
					userId: input.userId,
				},
			},
		});

		return itemSharing;
	}

	public async deleteSharingById(id: number): Promise<void> {
		await prisma.itemSharing.delete({
			where: {
				id: id,
			},
		});
	}
}
