import { cookies } from 'next/headers';
import { isLocale, type Locale } from './translations';

export async function getServerLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get('mull_locale')?.value;
  return isLocale(v) ? v : 'en';
}
