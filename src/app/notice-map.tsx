"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { ReceiptStatus } from "@/lib/status";

export type MapPoint = {
  lat: number;
  lng: number;
  exact: boolean;
  notices: { id: string; name: string; kind: string; status: ReceiptStatus; begin: string; end: string; url: string }[];
};

// ponytail: 이 파일에서 쓰는 네이버 지도 API만 최소한으로 타입을 적었다. 더 쓰게 되면 @types/navermaps
type LatLng = object;
type NMap = { fitBounds(b: object): void; setCenter(p: LatLng): void; setZoom(z: number): void; destroy(): void };
type NOverlay = { setMap(m: NMap | null): void };
type NInfo = { open(m: NMap, anchor: NOverlay): void; close(): void; setContent(c: HTMLElement): void };
type NaverMaps = {
  Map: new (el: HTMLElement, opts?: object) => NMap;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new (sw: LatLng, ne: LatLng) => { extend(p: LatLng): void };
  Point: new (x: number, y: number) => object;
  Marker: new (opts: object) => NOverlay;
  InfoWindow: new (opts: object) => NInfo;
  Event: { addListener(target: object, type: string, fn: () => void): void };
};
declare global {
  interface Window {
    naver?: { maps: NaverMaps };
    navermap_authFailure?: () => void;
  }
}

const COLOR: Record<ReceiptStatus, string> = { 접수중: "#059669", 접수예정: "#0284c7", 마감: "#a1a1aa" };

// 같은 좌표에 여러 공고가 있으면 가장 "살아있는" 상태 색을 쓴다.
const RANK: ReceiptStatus[] = ["접수중", "접수예정", "마감"];
const topStatus = (p: MapPoint) => RANK.find((s) => p.notices.some((n) => n.status === s)) ?? "마감";

function pin(p: MapPoint) {
  const c = COLOR[topStatus(p)];
  // 근사 위치(동·시 단위)는 속이 빈 점선 원으로 구분한다. 문자열에 공고 데이터는 넣지 않는다.
  const style = p.exact
    ? `background:${c};border:2px solid #fff`
    : `background:${c}33;border:2px dashed ${c}`;
  const count = p.notices.length > 1 ? p.notices.length : "";
  return `<div style="${style};width:22px;height:22px;border-radius:50%;box-shadow:0 1px 3px #0005;color:#fff;font:600 11px/18px sans-serif;text-align:center">${count}</div>`;
}

// 공고명·URL은 외부 API 값이라 innerHTML 대신 textContent로 넣는다.
function infoContent(p: MapPoint) {
  const box = document.createElement("div");
  box.style.cssText = "padding:12px 14px;max-width:280px;font:13px/1.5 sans-serif;color:#18181b";
  if (!p.exact) {
    const note = box.appendChild(document.createElement("p"));
    note.textContent = "정확한 위치가 아닌 동·시 단위 근사 위치입니다.";
    note.style.cssText = "margin:0 0 6px;color:#71717a;font-size:12px";
  }
  for (const n of p.notices) {
    const row = box.appendChild(document.createElement("div"));
    row.style.cssText = "margin-top:6px";
    const title = row.appendChild(document.createElement(isHttps(n.url) ? "a" : "strong"));
    title.textContent = n.name;
    if (title instanceof HTMLAnchorElement) {
      title.href = n.url;
      title.target = "_blank";
      title.rel = "noreferrer";
      title.style.cssText = "font-weight:600;color:#18181b";
    }
    const meta = row.appendChild(document.createElement("div"));
    meta.textContent = `${n.status} · ${n.kind} · 접수 ${n.begin} ~ ${n.end}`;
    meta.style.cssText = `color:${COLOR[n.status] === COLOR.마감 ? "#71717a" : COLOR[n.status]};font-size:12px`;
  }
  return box;
}

function isHttps(u: string) {
  try {
    return new URL(u).protocol === "https:";
  } catch {
    return false;
  }
}

export function NoticeMap({ points }: { points: MapPoint[] }) {
  const el = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    window.navermap_authFailure = () => setAuthError(true);
  }, []);

  useEffect(() => {
    const maps = window.naver?.maps;
    if (!ready || !maps || !el.current) return;

    const map = new maps.Map(el.current);
    const info = new maps.InfoWindow({ content: "", borderWidth: 0 });
    maps.Event.addListener(map, "click", () => info.close());
    const positions = points.map((p) => new maps.LatLng(p.lat, p.lng));

    points.forEach((p, i) => {
      const marker = new maps.Marker({
        map,
        position: positions[i],
        icon: { content: pin(p), anchor: new maps.Point(11, 11) },
        zIndex: RANK.length - RANK.indexOf(topStatus(p)), // 접수중 > 접수예정 > 마감 순으로 위에 그린다
      });
      // 정보창은 하나만 두고 내용만 바꾼다 (다른 핀을 누르면 이전 창이 닫힌다)
      maps.Event.addListener(marker, "click", () => {
        info.setContent(infoContent(p));
        info.open(map, marker);
      });
    });

    if (positions.length === 1) {
      map.setCenter(positions[0]);
      map.setZoom(14);
    } else if (positions.length > 1) {
      const bounds = new maps.LatLngBounds(positions[0], positions[0]);
      positions.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);
    }
    return () => map.destroy();
  }, [ready, points]);

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        onReady={() => setReady(true)}
      />
      {authError ? (
        <p className="mt-6 rounded border border-red-300 p-4 text-sm text-red-700 dark:border-red-800 dark:text-red-300">
          네이버 지도 인증에 실패했습니다. NCP 콘솔에서 이 주소({typeof location !== "undefined" ? location.origin : ""})가
          서비스 URL에 등록돼 있는지 확인하세요.
        </p>
      ) : (
        <div ref={el} className="mt-6 h-[60vh] min-h-80 w-full rounded border" aria-label="공고 위치 지도" />
      )}
      <p className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        {RANK.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full" style={{ background: COLOR[s] }} />
            {s}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full border-2 border-dashed border-zinc-500" />
          근사 위치 (동·시 단위)
        </span>
      </p>
    </>
  );
}
