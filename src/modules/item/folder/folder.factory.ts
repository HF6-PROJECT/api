import { AccessServiceFactory, SharingServiceFactory } from '../sharing/sharing.factory';
import FolderController from './folder.controller';
import FolderService from './folder.service';

export class FolderServiceFactory {
	static make() {
		return new FolderService(SharingServiceFactory.make());
	}
}

export class FolderControllerFactory {
	static make() {
		return new FolderController(FolderServiceFactory.make(), AccessServiceFactory.make());
	}
}
