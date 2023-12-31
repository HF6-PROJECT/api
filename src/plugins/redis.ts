import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import Redis from 'ioredis';
import { v4 } from 'uuid';

declare module 'fastify' {
	interface FastifyRequest {
		redis: Redis;
	}
	interface FastifyInstance {
		redis: Redis;
	}
}

declare module 'ioredis' {
	interface Redis {
		remember(key: string, ttl: number, callback: () => string | Promise<string>): Promise<string>;
		rememberJSON<T>(key: string, ttl: number, callback: () => T | Promise<void | T>): Promise<T>;
		invalidateCaches(...keys: string[]): Promise<void>;
	}
}

export let redis: Redis;

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		redis = new Redis(fastify.config.REDIS_URL, {
			keyPrefix:
				fastify.config.NODE_ENV === 'test'
					? /* istanbul ignore next */ `${v4()}:`
					: /* istanbul ignore next */ undefined,
			lazyConnect: true,
		}).on(
			'error',
			/* istanbul ignore next */ () => {
				return;
			},
		);

		await redis.connect().catch(
			/* istanbul ignore next */ () => {
				fastify.log.error(
					`Can't connect to redis server at ${redis.options.host}:${redis.options.port}`,
				);
			},
		);

		redis.remember = async (key, ttl_seconds, callback) => {
			let value = await redis.get(key);

			if (value !== null) {
				return value;
			}

			value = await callback();

			await redis.setex(key, ttl_seconds, value);

			return value;
		};

		redis.rememberJSON = async (key, ttl_seconds, callback) => {
			return JSON.parse(
				await redis.remember(key, ttl_seconds, async () => {
					return JSON.stringify(await callback());
				}),
			);
		};

		redis.invalidateCaches = async (...keys) => {
			await Promise.all(
				keys.map(async (key) => {
					// If the key is a pattern, delete all keys matching the pattern
					if (key.includes('*')) {
						// Get all keys matching pattern
						keys = await redis.keys(
							`${
								redis.options.keyPrefix ? redis.options.keyPrefix : /* istanbul ignore next */ ''
							}${key}`,
						);

						await Promise.all(
							keys.map(async (key) => {
								if (redis.options.keyPrefix) {
									await redis.del(key.replace(redis.options.keyPrefix, ''));
									return;
								}

								/* istanbul ignore next */
								await redis.del(key);
							}),
						);
					}

					await redis.del(key);
				}),
			);
		};

		fastify.decorate('redis', redis);
		fastify.decorateRequest('redis', {
			getter: /* istanbul ignore next */ () => redis,
		});

		fastify.addHook('onClose', async () => {
			redis.disconnect();
		});
	},
	{ dependencies: ['config'] },
);
