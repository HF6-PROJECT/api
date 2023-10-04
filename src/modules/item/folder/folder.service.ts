import { prisma } from '../../../plugins/prisma';
import { Folder, AddFolder, UpdateFolder, ItemFolder } from './folder.schema';

export default class FolderService {
	public async createFolder(input: AddFolder): Promise<Folder> {
		const itemFolder = await prisma.itemFolder.create({
			data: {
				color: input.color,
				item: {
					create: {
						name: input.name,
						mimeType: 'application/vnd.cloudstore.folder',
						ownerId: input.ownerId,
						parentId: input.parentId,
					},
				},
			},
			include: {
				item: true,
			},
		});

		return this.formatItemFolder(itemFolder);
	}

	public async getByItemId(itemId: number): Promise<Folder> {
		const itemFolder = await prisma.itemFolder.findUnique({
			where: {
				itemId,
			},
			include: {
				item: true,
			},
		});

		if (!itemFolder) {
			throw new Error('item.folder.notFound');
		}

		return this.formatItemFolder(itemFolder);
	}

	public async updateFolder(input: UpdateFolder): Promise<Folder> {
		const itemFolder = await prisma.itemFolder.update({
			data: {
				color: input.color,
				item: {
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
				item: true,
			},
		});

		return this.formatItemFolder(itemFolder);
	}

	public async deleteFolderByItemId(itemId: number): Promise<void> {
		await prisma.item.delete({
			where: {
				id: itemId,
			},
		});
	}

	private formatItemFolder(itemFolder: ItemFolder): Folder {
		return {
			color: itemFolder.color,
			...itemFolder.item,
		};
	}
}
