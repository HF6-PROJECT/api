import { prisma } from '../../../plugins/prisma';
import { Shortcut, AddShortcut, UpdateShortcut, ItemShortcut } from './shortcut.schema';

export default class ShortcutService {
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

		return this.formatItemShortcut(itemShortcut);
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
			throw new Error('item.shortcut.notFound');
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

		return this.formatItemShortcut(itemShortcut);
	}

	public async deleteShortcutByItemId(itemId: number): Promise<void> {
		await prisma.item.delete({
			where: {
				id: itemId,
			},
		});
	}

	private formatItemShortcut(itemShortcut: ItemShortcut): Shortcut {
		return {
			linkedItemId: itemShortcut.linkedItemId,
			...itemShortcut.shortcutItem,
		};
	}
}
