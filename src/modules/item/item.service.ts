import { prisma } from '../../plugins/prisma';
import { CreateItem } from './item.schema';

export default class ItemService {
	public async createItem(input: CreateItem) {
		await prisma.item.create({
			data: {
				name: input.name,
				mimeType: input.mimeType,
				blobUrl: input.blobUrl,
				ownerId: input.ownerId,
				parentId: input.parentId,
			},
		});
	}
}
