import { prisma } from '../../../plugins/prisma';
import { MissingError } from '../../../utils/error';
import ItemService from '../item.service';
import SharingService from '../sharing/sharing.service';
import { Folder, AddFolder, UpdateFolder, ItemFolder } from './folder.schema';

export default class FolderService {
	private sharingService: SharingService;

	constructor(sharingService: SharingService) {
		this.sharingService = sharingService;
	}

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

		if (input.parentId) {
			await this.sharingService.syncSharingsByItemId(input.parentId, itemFolder.item.id);
		}

		const folder = this.formatItemFolder(itemFolder);

		await ItemService.invalidateCachesForItem(folder);

		return folder;
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
			throw new MissingError('item.folder.notFound');
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

		const folder = this.formatItemFolder(itemFolder);

		await ItemService.invalidateCachesForItem(folder);

		return folder;
	}

	public async deleteFolderByItemId(itemId: number): Promise<void> {
		let folder: Folder;

		try {
			folder = await this.getByItemId(itemId);
		} catch (e) {
			/* istanbul ignore next */
			return;
		}

		await Promise.all([
			prisma.item.delete({
				where: {
					id: itemId,
				},
			}),
			ItemService.invalidateCachesForItem(folder),
		]);
	}

	private formatItemFolder(itemFolder: ItemFolder): Folder {
		return {
			color: itemFolder.color,
			...itemFolder.item,
		};
	}
}
