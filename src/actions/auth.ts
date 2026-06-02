'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

// ─── Validation schemas ──────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').trim(),
  email:    z.string().email('Please enter a valid email').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const LoginSchema = z.object({
  email:    z.string().email('Invalid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = RegisterSchema.safeParse({
    name:     formData.get('name'),
    email:    formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  // Check if email already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ['An account with this email already exists.'] } };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({
    data: { name, email, hashedPassword, provider: 'credentials' },
  });

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    // Ignore error
  }
  
  redirect('/');
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email:    formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid credentials.' };
        default:
          return { message: 'Something went wrong.' };
      }
    }
    // if it's NEXT_REDIRECT, it will be thrown, but we have redirect: false.
  }
  
  redirect('/');
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await signOut({ redirect: true, redirectTo: '/login' });
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/' });
}
