import { API_BASE as DEFAULT_API_BASE } from '@/constants/config';

let inMemoryApiBase: string | null = null;

const STORAGE_KEY = 'dn.apiBase';

export async function getApiBase(): Promise<string> {
  if (inMemoryApiBase) return inMemoryApiBase;
  try {
    // Web/localStorage only; native will fallback to default unless set during session
    // @ts-ignore
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored && /^https?:\/\//.test(stored)) {
      inMemoryApiBase = stored;
      return stored;
    }
  } catch { }
  return DEFAULT_API_BASE;
}

export async function setApiBase(nextBase: string): Promise<void> {
  inMemoryApiBase = nextBase;
  try {
    // @ts-ignore
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, nextBase);
    }
  } catch { }
}


