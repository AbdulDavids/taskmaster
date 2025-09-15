import { BETTER_AUTH_SECRET } from '$env/static/private';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { TextEncoder } from 'util';

type VerifyJwtResult =
  | {
      valid: true;
      payload: JWTPayload;
    }
  | {
      valid: false;
      error: unknown;
    };

export const verifyJwt = async (token: string): Promise<VerifyJwtResult> => {
  try {
    const secret = new TextEncoder().encode(BETTER_AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      requiredClaims: ['sub', 'iat', 'exp']
    });
    return { valid: true, payload };
  } catch (err) {
    console.error('JWT verification error:', err);
    return { valid: false, error: err };
  }
};

/**
 * Generate a random string of specified length and character set.
 *
 * Pass a time span like '1h', '30m', '15s' to the expiresIn parameter. Default is '1h'.
 */
export async function generateJwt(params: { userId: string; expiresIn?: string }): Promise<string> {
  const secret = new TextEncoder().encode(BETTER_AUTH_SECRET);
  const jwt = new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(params.userId)
    .setIssuedAt()
    .setExpirationTime(params.expiresIn ?? '1h');

  return await jwt.sign(secret);
}
