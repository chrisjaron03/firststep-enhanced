export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + '_firststep_salt_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
}

export function parseDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/tablet|ipad/.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile'
  return 'desktop'
}

export function parseBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/edg/.test(ua)) return 'Edge'
  if (/chrome/.test(ua) && !/chromium/.test(ua)) return 'Chrome'
  if (/firefox/.test(ua)) return 'Firefox'
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'Safari'
  return 'Other'
}

export function getPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}
