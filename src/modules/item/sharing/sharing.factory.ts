import { UserServiceFactory } from '../../auth/auth.factory';
import { ItemServiceFactory } from '../item.factory';
import AccessService from './access.service';
import SharingController from './sharing.controller';
import SharingService from './sharing.service';

export class SharingServiceFactory {
	static make() {
		return new SharingService(ItemServiceFactory.make());
	}
}

export class AccessServiceFactory {
	static make() {
		return new AccessService(ItemServiceFactory.make(), SharingServiceFactory.make());
	}
}

export class SharingControllerFactory {
	static make() {
		return new SharingController(
			SharingServiceFactory.make(),
			AccessServiceFactory.make(),
			UserServiceFactory.make(),
		);
	}
}
