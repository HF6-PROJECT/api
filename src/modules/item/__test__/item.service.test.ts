import { User } from '@prisma/client';
import UserService from '../../auth/user.service';
import ItemService from '../item.service';
import FolderService from '../folder/folder.service';
import SharingService from '../sharing/sharing.service';
import BlobService from '../blob/blob.service';
import ShortcutService from '../shortcut/shortcut.service';
import { UserServiceFactory } from '../../auth/auth.factory';
import { FolderServiceFactory } from '../folder/folder.factory';
import { BlobServiceFactory } from '../blob/blob.factory';
import { ShortcutServiceFactory } from '../shortcut/shortcut.factory';
import { SharingServiceFactory } from '../sharing/sharing.factory';
import { ItemServiceFactory } from '../item.factory';

describe('ItemService', () => {
	let itemService: ItemService;
	let userService: UserService;
	let folderService: FolderService;
	let sharingService: SharingService;
	let blobService: BlobService;
	let shortcutService: ShortcutService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		itemService = ItemServiceFactory.make();
		userService = UserServiceFactory.make();
		folderService = FolderServiceFactory.make();
		sharingService = SharingServiceFactory.make();
		blobService = BlobServiceFactory.make();
		shortcutService = ShortcutServiceFactory.make();

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
			await blobService.createBlob({
				mimeType: 'text/plain',
				name: 'test1.txt',
				ownerId: user.id,
				parentId: null,
				blobUrl: 'https://example.com/test1.txt',
			});

			const folder = await folderService.createFolder({
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

			await shortcutService.createShortcut({
				name: 'Shortcut',
				ownerId: user.id,
				linkedItemId: folder.id,
				parentId: null,
			});

			const items = await itemService.getByOwnerIdAndParentId(user.id, null);

			expect(items).toEqual([
				{
					id: expect.any(Number),
					name: 'test1.txt',
					blobUrl: 'https://example.com/test1.txt',
					parentId: null,
					ownerId: user.id,
					mimeType: 'text/plain',
					itemId: expect.any(Number),
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
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
					isStarred: false,
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
					isStarred: false,
				},
				{
					id: expect.any(Number),
					name: 'Shortcut',
					parentId: null,
					ownerId: user.id,
					linkedItemId: folder.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.shortcut',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
			]);
		});

		it('should return empty array, when no items are found', async () => {
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

			await sharingService.createSharing(
				{
					itemId: folder.id,
					userId: otherUser.id,
				},
				user.id,
			);

			await blobService.createBlob({
				mimeType: 'text/plain',
				name: 'test1.txt',
				ownerId: user.id,
				parentId: folder.id,
				blobUrl: 'https://example.com/test1.txt',
			});

			const blob2 = await blobService.createBlob({
				mimeType: 'text/plain',
				name: 'test2.txt',
				ownerId: user.id,
				parentId: folder.id,
				blobUrl: 'https://example.com/test2.txt',
			});
			await sharingService.deleteSharing({ itemId: blob2.id, userId: otherUser.id }, user.id);

			const folder1 = await folderService.createFolder({
				name: 'Folder1',
				color: '#123456',
				ownerId: user.id,
				parentId: folder.id,
			});
			const folder2 = await folderService.createFolder({
				name: 'Folder2',
				color: '#111111',
				ownerId: user.id,
				parentId: folder.id,
			});
			await sharingService.deleteSharing({ itemId: folder2.id, userId: otherUser.id }, user.id);

			const folder3 = await folderService.createFolder({
				name: 'Folder3',
				color: '#987654',
				ownerId: user.id,
				parentId: folder.id,
			});

			await shortcutService.createShortcut({
				name: 'Shortcut1',
				ownerId: user.id,
				linkedItemId: folder1.id,
				parentId: folder.id,
			});

			const shortcut2 = await shortcutService.createShortcut({
				name: 'Shortcut2',
				ownerId: user.id,
				linkedItemId: folder3.id,
				parentId: folder.id,
			});
			await sharingService.deleteSharing({ itemId: shortcut2.id, userId: otherUser.id }, user.id);

			const itemsOwner = await itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(
				user.id,
				folder.id,
			);
			const itemsSharredUser = await itemService.getAllOwnedAndSharredItemsByParentIdAndUserId(
				otherUser.id,
				folder.id,
			);

			expect(itemsOwner).toEqual([
				{
					id: expect.any(Number),
					name: 'test1.txt',
					blobUrl: 'https://example.com/test1.txt',
					parentId: folder.id,
					ownerId: user.id,
					mimeType: 'text/plain',
					itemId: expect.any(Number),
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
				{
					id: expect.any(Number),
					name: 'test2.txt',
					blobUrl: 'https://example.com/test2.txt',
					parentId: folder.id,
					ownerId: user.id,
					mimeType: 'text/plain',
					itemId: expect.any(Number),
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
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
					isStarred: false,
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
					isStarred: false,
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
					isStarred: false,
				},
				{
					id: expect.any(Number),
					name: 'Shortcut1',
					parentId: folder.id,
					linkedItemId: folder1.id,
					ownerId: user.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.shortcut',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
				{
					id: expect.any(Number),
					name: 'Shortcut2',
					parentId: folder.id,
					linkedItemId: folder3.id,
					ownerId: user.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.shortcut',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
			]);
			expect(itemsSharredUser).toEqual([
				{
					id: expect.any(Number),
					name: 'test1.txt',
					blobUrl: 'https://example.com/test1.txt',
					parentId: folder.id,
					ownerId: user.id,
					mimeType: 'text/plain',
					itemId: expect.any(Number),
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
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
					isStarred: false,
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
					isStarred: false,
				},
				{
					id: expect.any(Number),
					name: 'Shortcut1',
					parentId: folder.id,
					linkedItemId: folder1.id,
					ownerId: user.id,
					itemId: expect.any(Number),
					mimeType: 'application/vnd.cloudstore.shortcut',
					createdAt: expect.any(Date),
					deletedAt: null,
					updatedAt: expect.any(Date),
					isStarred: false,
				},
			]);
		});

		it('should return empty array, when no items are found', async () => {
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

	describe('getItemByIdWithSharingsAndOwner()', () => {
		it("should throw error, when item doesn't exist", async () => {
			await expect(itemService.getItemByIdWithSharingsAndOwner(1234)).rejects.toThrow();
		});
	});

	describe('getItemByIdWithInclude()', () => {
		it("should throw error, when item doesn't exist", async () => {
			await expect(itemService.getItemByIdWithInclude(1234, user.id)).rejects.toThrow();
		});
	});

	describe('getItemPath()', () => {
		it('should return itemPath', async () => {
			const folder1 = await folderService.createFolder({
				name: 'Folder1',
				color: '#123456',
				ownerId: user.id,
				parentId: null,
			});

			const folder2 = await folderService.createFolder({
				name: 'Folder2',
				color: '#123456',
				ownerId: user.id,
				parentId: folder1.id,
			});

			const folder3 = await folderService.createFolder({
				name: 'Folder3',
				color: '#123456',
				ownerId: user.id,
				parentId: folder2.id,
			});

			expect(await itemService.getItemPath(folder1.id, user.id)).toEqual({
				id: folder1.id,
				name: folder1.name,
				parent: null,
			});

			expect(await itemService.getItemPath(folder2.id, user.id)).toEqual({
				id: folder2.id,
				name: folder2.name,
				parent: {
					id: folder1.id,
					name: folder1.name,
					parent: null,
				},
			});

			expect(await itemService.getItemPath(folder3.id, user.id)).toEqual({
				id: folder3.id,
				name: folder3.name,
				parent: {
					id: folder2.id,
					name: folder2.name,
					parent: {
						id: folder1.id,
						name: folder1.name,
						parent: null,
					},
				},
			});
		});

		it("should return undefined, when item doesn't exist", async () => {
			await expect(itemService.getItemPath(1234, user.id)).resolves.toBeUndefined();
		});
	});
});
