import { FromSchema } from 'json-schema-to-ts';

const createUserSchema = {
	$id: 'createUserSchema',
	type: 'object',
	properties: {
		name: {
			type: 'string',
			minLength: 1,
			errorMessage: {
				type: 'name.type',
				minLength: 'name.minLength',
			},
		},
		email: {
			type: 'string',
			format: 'email',
			errorMessage: {
				type: 'email.type',
				format: 'email.format',
			},
		},
		password: {
			type: 'string',
			minLength: 8,
			errorMessage: {
				type: 'password.type',
				minLength: 'password.minLength',
			},
		},
	},
	required: ['email', 'password', 'name'],
	errorMessage: {
		required: {
			email: 'email.required',
			password: 'password.required',
			name: 'name.required',
		},
	},
} as const;

const createUserResponseSchema = {
	$id: 'createUserResponseSchema',
	type: 'object',
	properties: {
		name: {
			type: 'string',
		},
		email: {
			type: 'string',
			format: 'email',
		},
	},
};

const loginSchema = {
	$id: 'loginSchema',
	type: 'object',
	properties: {
		email: {
			type: 'string',
			format: 'email',
			errorMessage: {
				type: 'email.type',
				format: 'email.format',
			},
		},
		password: {
			type: 'string',
			errorMessage: {
				type: 'password.type',
			},
		},
	},
	required: ['email', 'password'],
	errorMessage: {
		required: {
			email: 'email.required',
			password: 'password.required',
		},
	},
} as const;

const loginResponseSchema = {
	$id: 'loginResponseSchema',
	type: 'object',
	properties: {
		accessToken: {
			type: 'string',
		},
	},
};

const refreshResponseSchema = {
	$id: 'refreshResponseSchema',
	type: 'object',
	properties: {
		accessToken: {
			type: 'string',
		},
	},
};

const logoutResponseSchema = {
	$id: 'logoutResponseSchema',
	type: 'object',
	properties: {},
};

const userResponseSchema = {
	$id: 'userResponseSchema',
	type: 'object',
	properties: {
		name: {
			type: 'string',
		},
		email: {
			type: 'string',
			format: 'email',
		},
	},
};

export type LoginInput = FromSchema<typeof loginSchema>;
export type CreateUserInput = FromSchema<typeof createUserSchema>;

export const authSchemas = [
	createUserSchema,
	createUserResponseSchema,
	loginSchema,
	loginResponseSchema,
	refreshResponseSchema,
	logoutResponseSchema,
	userResponseSchema,
];
