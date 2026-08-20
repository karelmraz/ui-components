/** Shared fetch wrapper: JSON on 2xx, a throw with the host in the message otherwise */
export async function getJson<T>(url: string, signal: AbortSignal, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, signal });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return res.json() as Promise<T>;
}
