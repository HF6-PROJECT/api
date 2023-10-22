import { prisma } from '../../../plugins/prisma';
import { MissingError } from '../../../utils/error';
import ItemService from '../item.service';
import SharingService from '../sharing/sharing.service';
import { Shortcut, AddShortcut, UpdateShortcut, ItemShortcut } from './shortcut.schema';

export default class ShortcutService {
	private sharingService: SharingService;

	constructor(sharingService: SharingService) {
		this.sharingService = sharingService;
	}

	public async createShortcut(input: AddShortcut): Promise<Shortcut> {
		const itemShortcut = await prisma.itemShortcut.create({
			data: {
				linkedItem: {
					connect: {
						id: input.linkedItemId,
					},
				},
				shortcutItem: {
					create: {
						name: input.name,
						mimeType: 'application/vnd.cloudstore.shortcut',
						ownerId: input.ownerId,
						parentId: input.parentId,
					},
				},
			},
			include: {
				shortcutItem: true,
			},
		});

		if (input.parentId) {
			await this.sharingService.syncSharingsByItemId(input.parentId, itemShortcut.shortcutItem.id);
		}

		const shortcut = this.formatItemShortcut(itemShortcut);

		await ItemService.invalidateCachesForItem(shortcut);

		return shortcut;
	}

	public async getByItemId(itemId: number): Promise<Shortcut> {
		const itemShortcut = await prisma.itemShortcut.findUnique({
			where: {
				itemId,
			},
			include: {
				shortcutItem: true,
			},
		});

		if (!itemShortcut) {
			throw new MissingError('item.shortcut.notFound');
		}

		return this.formatItemShortcut(itemShortcut);
	}

	public async updateShortcut(input: UpdateShortcut): Promise<Shortcut> {
		const itemShortcut = await prisma.itemShortcut.update({
			data: {
				shortcutItem: {
					update: {
						name: input.name,
						parentId: input.parentId,
					},
				},
			},
			where: {
				itemId: input.id,
			},
			include: {
				shortcutItem: true,
			},
		});

		const shortcut = this.formatItemShortcut(itemShortcut);

		await ItemService.invalidateCachesForItem(shortcut);

		return shortcut;
	}

	public async deleteShortcutByItemId(itemId: number): Promise<void> {
		let shortcut: Shortcut;

		try {
			shortcut = await this.getByItemId(itemId);
		} catch (e) {
			return;
		}

		await Promise.all([
			prisma.item.delete({
				where: {
					id: itemId,
				},
			}),
			ItemService.invalidateCachesForItem(shortcut),
		]);
	}

	private formatItemShortcut(itemShortcut: ItemShortcut): Shortcut {
		return {
			linkedItemId: itemShortcut.linkedItemId,
			...itemShortcut.shortcutItem,
		};
	}
}
