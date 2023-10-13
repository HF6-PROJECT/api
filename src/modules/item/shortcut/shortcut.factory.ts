import { AccessServiceFactory, SharingServiceFactory } from '../sharing/sharing.factory';
import ShortcutController from './shortcut.controller';
import ShortcutService from './shortcut.service';

export class ShortcutServiceFactory {
	static make() {
		return new ShortcutService(SharingServiceFactory.make());
	}
}

export class ShortcutControllerFactory {
	static make() {
		return new ShortcutController(ShortcutServiceFactory.make(), AccessServiceFactory.make());
	}
}
