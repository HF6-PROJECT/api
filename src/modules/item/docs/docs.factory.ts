import { AccessServiceFactory, SharingServiceFactory } from '../sharing/sharing.factory';
import DocsController from './docs.controller';
import DocsService from './docs.service';

export class DocsServiceFactory {
	static make() {
		return new DocsService(SharingServiceFactory.make());
	}
}

export class DocsControllerFactory {
	static make() {
		return new DocsController(DocsServiceFactory.make(), AccessServiceFactory.make());
	}
}
