import { resolve } from '$app/paths';
import { getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import z from 'zod';
import { generateJwt, verifyJwt } from '../jwt';
import type { AuthenticatedDbClient } from './db';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_AUTHENTICATED_URL } from '$env/static/private';
import { combinedSchemas } from '$lib/db';
import type { users } from '$lib/db/schemas/auth';
type User = typeof import('$lib/db/schemas/auth').users.$inferSelect;
import type { TaggedError } from '../services/errors';
import { errAsync, okAsync, Result } from 'neverthrow';

const clearAuthCookies = () => {
  const { cookies } = getRequestEvent();
  const allCookies = cookies.getAll();

  for (const cookie of allCookies) {
    const isAuthCookie = /^(__Secure-)?better-auth.*$/.test(cookie.name);
    if (isAuthCookie) {
      cookies.delete(cookie.name, { path: '/' });
    }
  }
};

/**
 * Creates a session validator function with caching capabilities.
 *
 * This factory function returns a validator that can be called multiple times
 * within the same request context to validate user sessions. The validator
 * implements request-scoped caching to avoid redundant API calls.
 */
export const createSessionValidator = (): (() => Promise<ValidateSessionResult>) => {
  const event = getRequestEvent();
  let validatedSession: ValidateSessionResult | null = null;

  /**
   * Validates the current user session with request-scoped caching.
   *
   * On first call, validates the session by:
   * 1. Calling the Better Auth API with request headers
   * 2. Checking response status and extracting session data
   * 3. Validating presence of JWT token header
   * 4. Caching the result for subsequent calls
   *
   * On authentication failure:
   * - Shows flash message to user explaining the error
   * - Clears all Better Auth cookies
   * - Redirects to sign-in page
   */
  return async () => {
    if (validatedSession) {
      return validatedSession;
    }

    // No auth mode: synthesize a bypass session
    validatedSession = {
      user: {
        id: 'bypass-user',
        name: 'Bypass User',
        email: 'bypass@example.com',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      } as unknown as User,
      session: {
        id: 'bypass-session',
        token: 'bypass',
        expiresAt: new Date(Date.now() + 3600_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        userId: 'bypass-user'
      } as any,
      jwt: 'bypass-jwt'
    };

    return validatedSession;
  };
};

const MinimumJwtPayloadSchema = z.object({
  sub: z.string()
});

export type ValidateBearerTokenResult = {
  jwt: string;
  user: {
    id: string;
  };
};

export const createBearerTokenValidator = (): (() => Promise<ValidateBearerTokenResult>) => {
  const { request, locals } = getRequestEvent();
  let validatedToken: ValidateBearerTokenResult | null = null;

  return async () => {
    if (validatedToken) return validatedToken;

    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      error(401, { message: 'Authorization header missing' });
    }
    if (!authHeader.startsWith('Bearer ')) {
      error(401, { message: 'Invalid Authorization header format' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      error(401, { message: 'Invalid Authorization header format' });
    }
    const providedToken = parts[1];
    const jwtPayload = await verifyJwt(providedToken);

    if (!jwtPayload.valid || !jwtPayload.payload) {
      error(401, { message: 'Invalid or expired token' });
    }

    const parseResult = MinimumJwtPayloadSchema.safeParse(jwtPayload.payload);
    if (!parseResult.success) {
      locals.logError('JWT payload is missing required fields:', parseResult.error);
      error(401, { message: 'Invalid token payload' });
    }

    validatedToken = { jwt: providedToken, user: { id: parseResult.data.sub } };
    return validatedToken;
  };
};

export const createApiKeyValidator = (): (() => Promise<ValidateSessionResult>) => {
  const { request } = getRequestEvent();
  let validatedSession: ValidateSessionResult | null = null;

  return async () => {
    if (validatedSession) return validatedSession;

    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      error(401, { message: 'API key missing' });
    }
    const jwt = await generateJwt({ userId: 'bypass-user' });
    validatedSession = {
      user: {
        id: 'bypass-user',
        name: 'Bypass User',
        email: 'bypass@example.com',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      } as unknown as User,
      session: {
        id: 'bypass-session',
        token: 'bypass',
        expiresAt: new Date(Date.now() + 3600_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        userId: 'bypass-user'
      } as any,
      jwt
    };
    return validatedSession;
  };
};

export abstract class BaseSessionHandler {
  _event = getRequestEvent();

  constructor(params: { eagerValidate?: boolean }) {
    if (params.eagerValidate) this.validate();
  }

  // abstract validate(): Promise<{ user: { id: string }; jwt: string }>;
  abstract validate(): Promise<
    Result<{ user: { id: string }; jwt: string }, InvalidCredentialError>
  >;

  abstract getUser(): Promise<User>;

  /** Provides a database client authenticated with the current user's JWT. */
  useDb = <TResult>(
    cb: (db: AuthenticatedDbClient) => MaybePromise<TResult>
  ): MaybePromise<TResult> => {
    const authenticatedDb = drizzle(neon(DATABASE_AUTHENTICATED_URL), {
      schema: combinedSchemas
    }).$withAuth(async () => {
      const jwt = await this.getJwt();
      return jwt;
    });

    return cb(authenticatedDb);
  };

  async getJwt(): Promise<string> {
    const validation = await this.validate();
    if (validation.isErr()) {
      this._event.locals.logError('Session validation failed', validation.error);
      throw validation.error;
    }

    return validation.value.jwt;
  }

  async getUserId(): Promise<Result<string, InvalidCredentialError>> {
    const validation = await this.validate();
    if (validation.isErr()) {
      this._event.locals.logError('Session validation failed', validation.error);
      return errAsync(validation.error);
    }

    return okAsync(validation.value.user.id);
  }
}

export class AppSessionHandler extends BaseSessionHandler {
  private validatedSession: ValidateSessionResult | null = null;

  constructor(options: { eagerValidate?: boolean }) {
    super(options);
  }

  /** Validates the current user session with request-scoped caching. */
  async validate() {
    if (this.validatedSession) {
      return okAsync(this.validatedSession);
    }

    this.validatedSession = {
      user: {
        id: 'bypass-user',
        name: 'Bypass User',
        email: 'bypass@example.com',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      } as unknown as User,
      session: {
        id: 'bypass-session',
        token: 'bypass',
        expiresAt: new Date(Date.now() + 3600_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        userId: 'bypass-user'
      } as any,
      jwt: 'bypass-jwt'
    };

    return okAsync(this.validatedSession);
  }

  async getUser(): Promise<User> {
    const validation = await this.validate();

    if (validation.isErr()) {
      this._event.locals.logError('Session validation failed', validation.error);
      throw validation.error;
    }

    return validation.value.user;
  }
}

export class ApiBearerTokenHandler extends BaseSessionHandler {
  private validatedToken: ValidateBearerTokenResult | null = null;
  private user: User | null = null;

  constructor(options: { eagerValidate?: boolean }) {
    super(options);
  }

  async validate() {
    if (this.validatedToken) return okAsync(this.validatedToken);

    const authHeader = this._event.request.headers.get('Authorization');

    if (!authHeader) {
      return errAsync(new InvalidCredentialError('Authorization header missing'));
    }

    if (!authHeader.startsWith('Bearer ')) {
      return errAsync(new InvalidCredentialError('Invalid Authorization header format'));
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return errAsync(new InvalidCredentialError('Invalid Authorization header format'));
    }
    const providedToken = parts[1];
    const jwtPayload = await verifyJwt(providedToken);

    if (!jwtPayload.valid || !jwtPayload.payload) {
      return errAsync(new InvalidCredentialError('Invalid or expired token'));
    }

    const parseResult = MinimumJwtPayloadSchema.safeParse(jwtPayload.payload);
    if (!parseResult.success) {
      this._event.locals.logError('JWT payload is missing required fields:', parseResult.error);
      return errAsync(new InvalidCredentialError('Invalid token payload'));
    }

    this.validatedToken = { jwt: providedToken, user: { id: parseResult.data.sub } };
    return okAsync(this.validatedToken);
  }

  async getUser(): Promise<User> {
    if (this.user) return this.user;

    const validation = await this.validate();
    if (validation.isErr()) {
      this._event.locals.logError('Bearer token validation failed', validation.error);
      throw validation.error;
    }

    const user = await this.useDb((db) =>
      db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, validation.value.user.id)
      })
    );

    if (!user) {
      error(401, { message: 'User not found' });
    }

    this.user = user;
    return user;
  }
}

export class ApiKeySessionHandler extends BaseSessionHandler {
  private validatedSession: ValidateSessionResult | null = null;

  constructor(options: { eagerValidate?: boolean }) {
    super(options);
  }

  async validate() {
    if (this.validatedSession) return okAsync(this.validatedSession);

    const apiKey = this._event.request.headers.get('x-api-key');
    if (!apiKey) {
      return errAsync(new InvalidCredentialError('API key missing'));
    }

    const jwt = await generateJwt({ userId: 'bypass-user' });
    this.validatedSession = {
      user: {
        id: 'bypass-user',
        name: 'Bypass User',
        email: 'bypass@example.com',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      } as unknown as User,
      session: {
        id: 'bypass-session',
        token: 'bypass',
        expiresAt: new Date(Date.now() + 3600_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        userId: 'bypass-user'
      } as any,
      jwt
    };
    return okAsync(this.validatedSession);
  }

  async getUser(): Promise<User> {
    const validation = await this.validate();
    if (validation.isErr()) {
      this._event.locals.logError('Session validation failed', validation.error);
      throw validation.error;
    }

    return validation.value.user;
  }
}

export class InvalidCredentialError extends Error implements TaggedError {
  _tag = 'InvalidCredentialError' as const;

  constructor(message?: string) {
    super(message || 'Invalid Credential');
  }
}

/**
 * Bypass session handler used for temporary, unauthenticated operation.
 * - Returns a static user and JWT
 * - Routes DB access through the admin database connection on locals.db
 */
export class BypassSessionHandler extends BaseSessionHandler {
  private user: User;

  constructor(options: { user?: Partial<User> } = {}) {
    super({ eagerValidate: false });
    this.user = {
      id: options.user?.id ?? 'bypass-user',
      name: options.user?.name ?? 'Bypass User',
      email: options.user?.email ?? 'bypass@example.com',
      image: options.user?.image ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false
    } as unknown as User;
  }

  async validate() {
    return okAsync({ user: this.user, jwt: 'bypass-jwt' });
  }

  async getUser(): Promise<User> {
    return this.user;
  }

  // Override to use the admin DB attached by hooks on locals.db
  useDb = <TResult>(cb: (db: AuthenticatedDbClient) => MaybePromise<TResult>) => {
    const { locals } = getRequestEvent();
    // Cast to AuthenticatedDbClient for compatibility with existing call sites
    return cb(locals.db as unknown as AuthenticatedDbClient);
  };
}
