'use server';

import { cookies } from 'next/headers';

export async function setCookie(name: string, value: string) {
  cookies().set(name, value, { path: '/' });
  console.log('cookie set', name, value);
}
