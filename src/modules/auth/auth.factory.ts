import AuthController from './auth.controller';
import AuthService from './auth.service';
import UserService from './user.service';

export class UserServiceFactory {
	static make() {
		return new UserService();
	}
}

export class AuthServiceFactory {
	static make() {
		return new AuthService();
	}
}

export class AuthControllerFactory {
	static make() {
		return new AuthController(AuthServiceFactory.make(), UserServiceFactory.make());
	}
}
