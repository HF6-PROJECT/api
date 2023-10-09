import { prisma } from '../../../plugins/prisma';
import { Docs, AddDocs, UpdateDocs, ItemDocs } from './docs.schema';

export default class DocsService {
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

		return this.formatitemDocs(itemDocs);
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
			throw new Error('item.docs.notFound');
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

		return this.formatitemDocs(itemDocs);
	}

	public async deleteDocsByItemId(itemId: number): Promise<void> {
		await prisma.item.delete({
			where: {
				id: itemId,
			},
		});
	}

	private formatitemDocs(itemDocs: ItemDocs): Docs {
		return {
			text: itemDocs.text,
			...itemDocs.item,
		};
	}
}
