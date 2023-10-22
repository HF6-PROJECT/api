import { prisma } from '../../../plugins/prisma';
import { MissingError } from '../../../utils/error';
import ItemService from '../item.service';
import SharingService from '../sharing/sharing.service';
import { Docs, AddDocs, UpdateDocs, ItemDocs } from './docs.schema';

export default class DocsService {
	private sharingService: SharingService;

	constructor(sharingService: SharingService) {
		this.sharingService = sharingService;
	}

	public async createDocs(input: AddDocs): Promise<Docs> {
		const itemDocs = await prisma.itemDocs.create({
			data: {
				text: input.text,
				item: {
					create: {
						name: input.name,
						mimeType: 'application/vnd.cloudstore.docs',
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
			await this.sharingService.syncSharingsByItemId(input.parentId, itemDocs.item.id);
		}

		const docs = this.formatitemDocs(itemDocs);

		await ItemService.invalidateCachesForItem(docs);

		return docs;
	}

	public async getByItemId(itemId: number): Promise<Docs> {
		const itemDocs = await prisma.itemDocs.findUnique({
			where: {
				itemId,
			},
			include: {
				item: true,
			},
		});

		if (!itemDocs) {
			throw new MissingError('item.docs.notFound');
		}

		return this.formatitemDocs(itemDocs);
	}

	public async updateDocs(input: UpdateDocs): Promise<Docs> {
		const itemDocs = await prisma.itemDocs.update({
			data: {
				text: input.text,
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

		const docs = this.formatitemDocs(itemDocs);

		await ItemService.invalidateCachesForItem(docs);

		return docs;
	}

	public async deleteDocsByItemId(itemId: number): Promise<void> {
		let docs: Docs;

		try {
			docs = await this.getByItemId(itemId);
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
			ItemService.invalidateCachesForItem(docs),
		]);
	}

	private formatitemDocs(itemDocs: ItemDocs): Docs {
		return {
			text: itemDocs.text,
			...itemDocs.item,
		};
	}
}
