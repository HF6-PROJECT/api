import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import ItemService from '../item.service';
import FolderService from '../folder/folder.service';
import SharingService from '../sharing/sharing.service';

// The tests can only be run with folder - Since the blob service has istanbul ignore next
describe('ItemService', () => {
	let itemService: ItemService;
	let userService: UserService;
	let folderService: FolderService;
	let sharingService: SharingService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		itemService = new ItemService();
		userService = new UserService();
		folderService = new FolderService();
		sharingService = new SharingService();

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

	describe('getByOwnerIdAndParentId()', () => {
		it('should return all items in users root folder', async () => {
			await folderService.createFolder({
				name: 'Folder1',
				color: '#123456',
				ownerId: user.id,
				parentId: null,
			});
			await folderService.createFolder({
				name: 'Folder2',
				color: '#987654',
				ownerId: user.id,
				parentId: null,
			});

			const items = await itemService.getByOwnerIdAndParentId(user.id, null);

			expect(items).toEqual([
				{
					id: expect.any(Number),
					name: 'Folder1',
					color: '#123456',
					parentId: null,
					ownerId: user.id,
					mimeType: 'application/vnd.cloudstore.folder',
					itemId: expect.any(Number),
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
				},
				{
					id: expect.any(Number),
					name: 'Folder2',
					color: '#987654',
					parentId: null,
					ownerId: user.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.folder',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
				},
			]);
		});

		it('should return empty array', async () => {
			expect(await itemService.getByOwnerIdAndParentId(1234, null)).toStrictEqual([]);
			expect(await itemService.getByOwnerIdAndParentId(1234, 1234)).toStrictEqual([]);
		});
	});

	describe('getAllOwnedAndSharredItemsByParentIdAndUserId()', () => {
		it('should return all items in a folder, that you have access to', async () => {
			const folder = await folderService.createFolder({
				name: 'Parent Folder',
				color: '#123456',
				ownerId: user.id,
				parentId: null,
			});

			await sharingService.createSharing({
				itemId: folder.id,
				userId: otherUser.id,
			});

			const folder1 = await folderService.createFolder({
				name: 'Folder1',
				color: '#123456',
				ownerId: user.id,
				parentId: folder.id,
			});
			await folderService.createFolder({
				name: 'Folder2',
				color: '#111111',
				ownerId: user.id,
				parentId: folder.id,
			});
			const folder3 = await folderService.createFolder({
				name: 'Folder3',
				color: '#987654',
				ownerId: user.id,
				parentId: folder.id,
			});

			await sharingService.createSharing({
				itemId: folder1.id,
				userId: otherUser.id,
			});

			await sharingService.createSharing({
				itemId: folder3.id,
				userId: otherUser.id,
			});

			const itemsOwner = await itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(
				user.id,
				folder.id,
			);
			const itemsSharredUser = await itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(
				otherUser.id,
				folder.id,
			);

			const expectedOwner = [
				{
					id: expect.any(Number),
					name: 'Folder1',
					color: '#123456',
					parentId: folder.id,
					ownerId: user.id,
					mimeType: 'application/vnd.cloudstore.folder',
					itemId: expect.any(Number),
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
				},
				{
					id: expect.any(Number),
					name: 'Folder2',
					color: '#111111',
					parentId: folder.id,
					ownerId: user.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.folder',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
				},
				{
					id: expect.any(Number),
					name: 'Folder3',
					color: '#987654',
					parentId: folder.id,
					ownerId: user.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.folder',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
				},
			];
			const expectedSharredUser = [
				{
					id: expect.any(Number),
					name: 'Folder1',
					color: '#123456',
					parentId: folder.id,
					ownerId: user.id,
					mimeType: 'application/vnd.cloudstore.folder',
					itemId: expect.any(Number),
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
				},
				{
					id: expect.any(Number),
					name: 'Folder3',
					color: '#987654',
					parentId: folder.id,
					ownerId: user.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.folder',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
				},
			];

			expect(itemsOwner).toEqual(expectedOwner);
			expect(itemsSharredUser).toEqual(expectedSharredUser);
		});

		it('should return empty array', async () => {
			expect(
				await itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(1234, null),
			).toStrictEqual([]);
			expect(
				await itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(1234, 1234),
			).toStrictEqual([]);
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
