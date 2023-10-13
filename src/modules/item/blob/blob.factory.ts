import { AccessServiceFactory, SharingServiceFactory } from '../sharing/sharing.factory';
import BlobController from './blob.controller';
import BlobService from './blob.service';

export class BlobServiceFactory {
	static make() {
		return new BlobService(SharingServiceFactory.make());
	}
}

export class BlobControllerFactory {
	static make() {
		return new BlobController(BlobServiceFactory.make(), AccessServiceFactory.make());
	}
}
