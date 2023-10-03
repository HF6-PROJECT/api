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

	describe('getById()', () => {
		it('should return item', async () => {
			const createdItem = await itemService.createItem({
				name: 'test.txt',
				ownerId: user.id,
				parentId: null,
				mimeType: 'text/plain',
			});

			const item = await itemService.getById(createdItem.id);

			expect(item).toEqual(createdItem);
		});

		it("should throw error, when item doesn't exist", async () => {
			await expect(itemService.getById(1234)).rejects.toThrow();
		});
	});
});
