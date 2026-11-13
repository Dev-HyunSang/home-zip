import { addressCandidates } from "./address.ts";

// 네이버 클라우드 Maps Geocoding. Client Secret이 필요하므로 서버에서만 호출한다.
const ENDPOINT = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=";

export type Geo = { lat: number; lng: number; exact: boolean };
export type GeoFile = Record<string, Geo | null>;

export async function geocodeLive(address: string): Promise<Geo | null> {
  const id = process.env.NAVER_MAP_CLIENT_ID;
  const secret = process.env.NAVER_MAP_CLIENT_SECRET;
  if (!id || !secret) throw new Error("NAVER_MAP_CLIENT_ID / NAVER_MAP_CLIENT_SECRET 가 없습니다");

  for (const c of addressCandidates(address)) {
    const res = await fetch(ENDPOINT + encodeURIComponent(c.q), {
      headers: { "x-ncp-apigw-api-key-id": id, "x-ncp-apigw-api-key": secret },
    });
    if (!res.ok) throw new Error(`네이버 Geocoding 오류: ${res.status}`);
    const { addresses }: { addresses?: { x: string; y: string }[] } = await res.json();
    const a = addresses?.[0];
    if (a) return { lat: Number(a.y), lng: Number(a.x), exact: c.exact };
  }
  return null;
}
