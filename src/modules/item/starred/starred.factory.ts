import { AccessServiceFactory } from '../sharing/sharing.factory';
import StarredController from './starred.controller';
import StarredService from './starred.service';

export class StarredServiceFactory {
	static make() {
		return new StarredService();
	}
}

export class StarredControllerFactory {
	static make() {
		return new StarredController(StarredServiceFactory.make(), AccessServiceFactory.make());
	}
}
