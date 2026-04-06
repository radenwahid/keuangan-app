import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { readJSONAsync, writeJSONAsync } from './db';
import { generateId } from './utils';
import { User } from './types';

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key-2024';

export function signAdminToken(userId: string, username: string): string {
  return jwt.sign({ role: 'admin', userId, username }, ADMIN_SECRET, { expiresIn: '8h' });
}

export function verifyAdminToken(token: string): { userId: string; username: string } | null {
  try {
    const p = jwt.verify(token, ADMIN_SECRET) as { role: string; userId: string; username: string };
    if (p.role !== 'admin') return null;
    return { userId: p.userId, username: p.username };
  } catch {
    return null;
  }
}

export async function getAdminAuth(): Promise<{ userId: string; username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdminAuth(): Promise<{ userId: string; username: string }> {
  const admin = await getAdminAuth();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

// Login admin: cek users.json dengan role admin
// Bootstrap: kalau belum ada admin, buat dari env variable
export async function verifyAdminLogin(
  username: string,
  password: string
): Promise<User | null> {
  const users = await readJSONAsync<User>('users.json');
  const admin = users.find((u) => u.role === 'admin' && u.name === username);

  if (admin) {
    const valid = await bcrypt.compare(password, admin.passwordHash);
    return valid ? admin : null;
  }

  // Bootstrap: belum ada admin di storage, cek env
  const envUser = process.env.ADMIN_USERNAME || 'adminakun1';
  const envPass = process.env.ADMIN_PASSWORD || 'adminakun1';

  if (username === envUser && password === envPass) {
    const newAdmin: User = {
      id: generateId(),
      name: envUser,
      email: `${envUser}@admin.local`,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    users.push(newAdmin);
    await writeJSONAsync('users.json', users);
    return newAdmin;
  }

  return null;
}

export async function updateAdminPassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const users = await readJSONAsync<User>('users.json');
  const idx = users.findIndex((u) => u.id === userId && u.role === 'admin');
  if (idx === -1) return { success: false, error: 'Admin tidak ditemukan' };

  const valid = await bcrypt.compare(oldPassword, users[idx].passwordHash);
  if (!valid) return { success: false, error: 'Password lama salah' };

  users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
  await writeJSONAsync('users.json', users);
  return { success: true };
}

export async function updateAdminUsername(
  userId: string,
  currentPassword: string,
  newUsername: string
): Promise<{ success: boolean; error?: string }> {
  const users = await readJSONAsync<User>('users.json');
  const idx = users.findIndex((u) => u.id === userId && u.role === 'admin');
  if (idx === -1) return { success: false, error: 'Admin tidak ditemukan' };

  const valid = await bcrypt.compare(currentPassword, users[idx].passwordHash);
  if (!valid) return { success: false, error: 'Password salah' };

  users[idx].name = newUsername;
  await writeJSONAsync('users.json', users);
  return { success: true };
}
