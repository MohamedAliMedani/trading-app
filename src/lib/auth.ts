import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

export function generateToken(payload: { id: string; email: string; role: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('fv_session')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function createSession(payload: { id: string; email: string; role: string }) {
    const token = generateToken(payload);
    const cookieStore = await cookies();
    cookieStore.set('fv_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('fv_session');
}
