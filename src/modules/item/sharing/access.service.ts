import SharingService from './sharing.service';
import ItemService from '../item.service';
import { Item } from '../item.schema';

export default class AccessService {
	private itemService: ItemService;
	private sharingService: SharingService;

	constructor(itemService: ItemService, sharingService: SharingService) {
		this.itemService = itemService;
		this.sharingService = sharingService;
	}

	public async hasAccessToItemId(itemId: number, userId: number): Promise<boolean> {
		const item = await this.itemService.getById(itemId);

        return await this.hasAccessToItem(item, userId);
	}

	public async hasAccessToItem(item: Item, userId: number): Promise<boolean> {
		if (item.ownerId === userId) {
			return true;
		}

		try {
			await this.sharingService.getByItemIdAndUserId(item.id, userId);

			return true;
		} catch (e) {
			return false;
		}
	}
}
