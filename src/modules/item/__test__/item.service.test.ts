import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import ItemService from '../item.service';

describe('ItemService', () => {
	let itemService: ItemService;
	let userService: UserService;

	let user: User;

	beforeAll(async () => {
		itemService = new ItemService();
		userService = new UserService();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
	});

	describe('createItem()', () => {
		it('should not throw exceptions', async () => {
			expect(
				itemService.createItem({
					name: 'test',
					mimeType: 'text/plain',
					blobUrl: 'https://example.com/test-ihufsdihudsfuds.txt',
					ownerId: user.id,
					parentId: null,
				}),
			).resolves.not.toThrow();
		});
	});
});
