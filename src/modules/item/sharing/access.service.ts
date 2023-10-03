import SharingService from './sharing.service';
import ItemService from '../item.service';

export default class AccessService {
	private itemService: ItemService;
	private sharingService: SharingService;

	constructor(itemService: ItemService, sharingService: SharingService) {
		this.itemService = itemService;
		this.sharingService = sharingService;
	}

	public async hasAccessToItem(itemId: number, userId: number): Promise<boolean> {
		const item = await this.itemService.getById(itemId);

		if (item.ownerId === userId) {
			return true;
		}

		try {
			await this.sharingService.getByItemIdAndUserId(itemId, userId);

			return true;
		} catch (e) {
			return false;
		}
	}
}
