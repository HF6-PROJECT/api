import ItemController from './item.controller';
import ItemService from './item.service';
import { AccessServiceFactory } from './sharing/sharing.factory';

export class ItemServiceFactory {
	static make() {
		return new ItemService();
	}
}

export class ItemControllerFactory {
	static make() {
		return new ItemController(ItemServiceFactory.make(), AccessServiceFactory.make());
	}
}
