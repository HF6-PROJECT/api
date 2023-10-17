import { User } from '@prisma/client';
import UserService from '../../../auth/user.service';
import BlobService from '../../blob/blob.service';
import { FastifyRequest } from 'fastify';
import AuthService from '../../../auth/auth.service';
import { HandleUploadBody } from '@vercel/blob/client';
import { BlobServiceFactory } from '../blob.factory';
import { AuthServiceFactory, UserServiceFactory } from '../../../auth/auth.factory';

describe('BlobService', () => {
	let blobService: BlobService;
	let userService: UserService;
	let authService: AuthService;

	let user: User;

	beforeAll(async () => {
		blobService = BlobServiceFactory.make();
		userService = UserServiceFactory.make();
		authService = AuthServiceFactory.make();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
	});

	describe('handleUpload()', () => {
		it('should return undefined tokenPayload if no formatTokenPayload callback is passed', async () => {
			const { accessToken } = await authService.createTokens(user.id);

			await blobService.handleUpload(
				{
					body: {
						type: 'blob.generate-client-token',
						payload: {
							callbackUrl: 'https://example.com/callback',
							clientPayload: JSON.stringify({ parentId: null }),
							pathname: 'test.txt',
						},
					} as HandleUploadBody,
					headers: {
						authorization: 'Bearer ' + accessToken,
					},
					raw: {
						url: 'https://example.com/test-ihufsdihudsfuds.txt',
					},
				} as unknown as FastifyRequest,
				['text/plain'],
				async ({ tokenPayload }) => {
					expect(tokenPayload).toBeUndefined();
				},
			);
		});
	});
});
