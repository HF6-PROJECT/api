import { User } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { prisma } from '../../plugins/prisma';
import { CreateUserInput } from './auth.schema';
import { AlreadyExistsError, MissingError } from '../../utils/error';

export default class UserService {
	public async createUser(input: CreateUserInput): Promise<User> {
		if (await this.isEmailInUse(input.email)) {
			throw new AlreadyExistsError('email.inUse');
		}

		return await prisma.user.create({
			data: {
				email: input.email,
				password: hashSync(input.password, 10),
				name: input.name,
			},
		});
	}

	private async isEmailInUse(email: string): Promise<boolean> {
		try {
			await this.getUserByEmail(email);

			return true;
		} catch (e) {
			return false;
		}
	}

	public async getUserByEmail(email: string): Promise<User> {
		const user = await prisma.user.findFirst({
			where: { email: email },
		});

		if (!user) {
			throw new MissingError('user.notFound');
		}

		return user;
	}

	public async getUserById(id: number): Promise<User> {
		const user = await prisma.user.findFirst({
			where: { id: id },
		});

		if (!user) {
			throw new MissingError('user.notFound');
		}

		return user;
	}
}
