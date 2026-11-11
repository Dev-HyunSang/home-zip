// Next 전용 캐시 래퍼. applyhome.ts / geocode.ts는 scripts/에서도 쓰도록 Next에 의존하지 않는다.
import { cacheLife } from "next/cache";
import { fetchNotices, type Notice } from "./applyhome.ts";
import { geocodeLive, type Geo, type GeoFile } from "./geocode.ts";
import saved from "../../data/geocode.json";

// since가 캐시 키에 들어가서 기간별로 따로 캐시된다.
export async function getNotices(since: string): Promise<Notice[]> {
  "use cache";
  cacheLife("hours");
  return fetchNotices(since);
}

// 1순위: `npm run geocode`로 저장해 둔 data/geocode.json
// 2순위: 파일에 없는 새 주소만 실시간 호출 (주소별로 최대한 오래 캐시)
export async function geocode(address: string): Promise<Geo | null> {
  "use cache";
  cacheLife("max");

  const hit = (saved as GeoFile)[address];
  if (hit !== undefined) return hit;
  console.warn(`[geocode] data/geocode.json에 없는 주소라 실시간 호출합니다. npm run geocode 로 갱신하세요: ${address}`);
  return geocodeLive(address);
}
