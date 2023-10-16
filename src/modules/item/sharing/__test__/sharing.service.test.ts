import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import FolderService from '../../folder/folder.service';
import SharingService from '../sharing.service';
import BlobService from '../../blob/blob.service';
import { UserServiceFactory } from '../../../auth/auth.factory';
import { FolderServiceFactory } from '../../folder/folder.factory';
import { SharingServiceFactory } from '../sharing.factory';
import { BlobServiceFactory } from '../../blob/blob.factory';

describe('SharingService', () => {
	let userService: UserService;
	let folderService: FolderService;
	let sharingService: SharingService;
	let blobService: BlobService;

	let user: User;
	let otherUser: User;

	beforeAll(async () => {
		userService = UserServiceFactory.make();
		folderService = FolderServiceFactory.make();
		sharingService = SharingServiceFactory.make();
		blobService = BlobServiceFactory.make();

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

	describe('deleteSharing()', () => {
		it('should delete sharing and all child sharings', async () => {
			const folder = await folderService.createFolder({
				name: 'Folder1',
				color: '#123456',
				ownerId: user.id,
				parentId: null,
			});
			await sharingService.createSharing({ itemId: folder.id, userId: otherUser.id }, user.id);

			const subFolder = await folderService.createFolder({
				name: 'Sub Folder',
				color: '#7890123',
				ownerId: user.id,
				parentId: folder.id,
			});

			const blob = await blobService.createBlob({
				mimeType: 'text/plain',
				name: 'test1.txt',
				ownerId: user.id,
				parentId: subFolder.id,
				blobUrl: 'https://example.com/test1.txt',
			});

			await Promise.all([
				expect(sharingService.getByItemIdAndUserId(folder.id, otherUser.id)).resolves.toBeDefined(),
				expect(
					sharingService.getByItemIdAndUserId(subFolder.id, otherUser.id),
				).resolves.toBeDefined(),
				expect(sharingService.getByItemIdAndUserId(blob.id, otherUser.id)).resolves.toBeDefined(),
			]);

			await sharingService.deleteSharing({ itemId: subFolder.id, userId: otherUser.id }, user.id);

			await Promise.all([
				expect(sharingService.getByItemIdAndUserId(folder.id, otherUser.id)).resolves.toBeDefined(),
				expect(
					sharingService.getByItemIdAndUserId(subFolder.id, otherUser.id),
				).rejects.toThrowError(),
				expect(sharingService.getByItemIdAndUserId(blob.id, otherUser.id)).rejects.toThrowError(),
			]);
		});
	});
});
