import { prisma } from '../../../plugins/prisma';
import { AlreadyExistsError, MissingError } from '../../../utils/error';
import ItemService from '../item.service';
import { Sharing, CreateSharing, UpdateSharing, DeleteSharing } from './sharing.schema';

export default class SharingService {
	private itemService: ItemService;

	constructor(itemService: ItemService) {
		this.itemService = itemService;
	}

	public async getById(id: number): Promise<Sharing> {
		const itemSharing = await prisma.itemSharing.findUnique({
			where: {
				id,
			},
		});

		if (!itemSharing) {
			throw new MissingError('item.sharing.notFound');
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
			throw new MissingError('item.sharing.notFound');
		}

		return itemSharing;
	}

	public async createSharing(input: CreateSharing, userId: number): Promise<Sharing> {
		const accessableItems =
			await this.itemService.getAllOwnedAndSharredItemsByParentIdAndUserIdRecursively(
				userId,
				input.itemId,
			);

		await prisma.itemSharing.createMany({
			data: accessableItems.map((item) => {
				return {
					itemId: item.id,
					userId: input.userId,
				};
			}),
			skipDuplicates: true,
		});

		await Promise.all([
			ItemService.invalidateCachesForUser(input.userId),
			ItemService.invalidateCachesForUser(userId),
		]);

		try {
			await this.getByItemIdAndUserId(input.itemId, input.userId);

			throw new AlreadyExistsError('item.sharing.alreadyExists');
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

	public async deleteSharing(input: DeleteSharing, userId: number): Promise<void> {
		try {
			const itemSharing = await prisma.itemSharing.findUniqueOrThrow({
				where: {
					itemId_userId: {
						itemId: input.itemId,
						userId: input.userId,
					},
				},
			});

			const accessableItems =
				await this.itemService.getAllOwnedAndSharredItemsByParentIdAndUserIdRecursively(
					userId,
					itemSharing.itemId,
				);

			await prisma.itemSharing.deleteMany({
				where: {
					OR: [
						{
							itemId: input.itemId,
							userId: input.userId,
						},
						{
							itemId: {
								in: accessableItems.map((item) => item.id),
							},
							userId: itemSharing.userId,
						},
					],
				},
			});

			await Promise.all([
				ItemService.invalidateCachesForUser(input.userId),
				ItemService.invalidateCachesForUser(userId),
			]);
		} catch (e) {
			// Nothing to do here
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

		await ItemService.invalidateCachesForUser(input.userId);

		return itemSharing;
	}

	public async deleteSharingByIdAndUserId(id: number, userId: number): Promise<void> {
		try {
			const itemSharing = await prisma.itemSharing.findUniqueOrThrow({
				where: {
					id: id,
				},
			});

			const accessableItems =
				await this.itemService.getAllOwnedAndSharredItemsByParentIdAndUserIdRecursively(
					userId,
					itemSharing.itemId,
				);

			await prisma.itemSharing.deleteMany({
				where: {
					OR: [
						{
							itemId: {
								in: accessableItems.map((item) => item.id),
							},
							userId: itemSharing.userId,
						},
						{
							id: id,
						},
					],
				},
			});

			await ItemService.invalidateCachesForUser(userId);
		} catch (e) {
			// Nothing to do here
		}
	}

	public async syncSharingsByItemId(fromItemId: number, toItemId: number) {
		const fromItem = await prisma.item.findUniqueOrThrow({
			where: {
				id: fromItemId,
			},
			include: {
				ItemSharing: true,
			},
		});

		const userIds = [fromItem.ownerId];
		fromItem.ItemSharing.forEach((sharing) => {
			userIds.push(sharing.userId);
		});

		await Promise.all(
			userIds.map(async (userId) => {
				await ItemService.invalidateCachesForUser(userId);
			}),
		);

		await prisma.itemSharing.createMany({
			data: userIds.map((userId) => {
				return {
					itemId: toItemId,
					userId: userId,
				};
			}),
			skipDuplicates: true,
		});
	}
}
