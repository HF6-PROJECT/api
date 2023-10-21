import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import ItemService from '../../item.service';
import AccessService from '../access.service';
import SharingService from '../sharing.service';
import { ItemServiceFactory } from '../../item.factory';
import { UserServiceFactory } from '../../../auth/auth.factory';
import { AccessServiceFactory, SharingServiceFactory } from '../sharing.factory';

describe('ItemService', () => {
	let itemService: ItemService;
	let accessService: AccessService;
	let userService: UserService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		itemService = ItemServiceFactory.make();
		userService = UserServiceFactory.make();
		sharingService = SharingServiceFactory.make();
		accessService = AccessServiceFactory.make();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
		otherUser = await userService.createUser({
			name: 'Joe Biden the 2nd',
			email: 'joe2@biden.com',
			password: '4321',
		});
	});

	describe('hasAccessToItem()', () => {
		it('should return true, when owner', async () => {
			const createdItem = await itemService.createItem({
				name: 'test.txt',
				ownerId: user.id,
				parentId: null,
				mimeType: 'text/plain',
			});

			const hasAccessToItem = await accessService.hasAccessToItemId(createdItem.id, user.id);

			expect(hasAccessToItem).toBeTruthy();
		});

		it('should return true, when not owned by you, but shared with you', async () => {
			const createdItem = await itemService.createItem({
				name: 'test.txt',
				ownerId: otherUser.id,
				parentId: null,
				mimeType: 'text/plain',
			});
			await sharingService.createSharing(
				{
					itemId: createdItem.id,
					userId: user.id,
				},
				otherUser.id,
			);

			const hasAccessToItem = await accessService.hasAccessToItemId(createdItem.id, user.id);

			expect(hasAccessToItem).toBeTruthy();
		});

		it('should return false, when not owned or shared with you', async () => {
			const createdItem = await itemService.createItem({
				name: 'test.txt',
				ownerId: otherUser.id,
				parentId: null,
				mimeType: 'text/plain',
			});

			const hasAccessToItem = await accessService.hasAccessToItemId(createdItem.id, user.id);

			expect(hasAccessToItem).toBeFalsy();
		});

		it("should throw error, when item doesn't exist", async () => {
			await expect(accessService.hasAccessToItemId(1234, user.id)).rejects.toThrow();
		});
	});
});
