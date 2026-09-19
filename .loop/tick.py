#!/usr/bin/env python3
"""루프 정지조건 판정 + 다음 태스크 선택. LOOP.md §0 에서 호출한다.

  python3.14 .loop/tick.py                       # 판정 후 STOP: 또는 NEXT: 출력
  python3.14 .loop/tick.py --done <id> --evidence "..."   # 태스크 완료 기록
  python3.14 .loop/tick.py --fail <id> --note "..."       # 실패 기록(3회 연속 → blocked)
  python3.14 .loop/tick.py --unblock <id>                 # 키가 생겼을 때 수동 해제
"""
import json, os, sys, subprocess
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SP = os.path.join(ROOT, ".loop", "state.json")
STOP = os.path.join(ROOT, ".loop", "STOP")

def load(): return json.load(open(SP, encoding="utf-8"))
def save(s): json.dump(s, open(SP, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
def now(): return datetime.now().astimezone()

def stamp(s, kind, task, msg):
    s["log"].append({"at": now().isoformat(timespec="seconds"), "kind": kind, "task": task, "msg": msg})

def keys_present():
    """T7 해제 판정 — 값은 절대 출력하지 않는다. 존재 여부만."""
    env = os.path.join(ROOT, "app", ".env.local")
    if not os.path.exists(env): return {}
    have = set()
    for line in open(env, encoding="utf-8"):
        k = line.split("=", 1)[0].strip()
        if k and not k.startswith("#") and "=" in line and line.split("=", 1)[1].strip():
            have.add(k)
    return have

def main():
    a = sys.argv[1:]
    s = load()

    if a and a[0] == "--done":
        tid = a[1]; ev = a[a.index("--evidence") + 1] if "--evidence" in a else ""
        for t in s["tasks"]:
            if t["id"] == tid: t["status"] = "done"; t["evidence"] = ev
        s["consecutiveFailures"].pop(tid, None)
        stamp(s, "done", tid, ev); save(s); print(f"기록: {tid} done"); return

    if a and a[0] == "--fail":
        tid = a[1]; note = a[a.index("--note") + 1] if "--note" in a else ""
        n = s["consecutiveFailures"].get(tid, 0) + 1
        s["consecutiveFailures"][tid] = n
        if n >= 3:
            for t in s["tasks"]:
                if t["id"] == tid: t["status"] = "blocked"; t["notes"] = note
            stamp(s, "blocked", tid, f"3회 연속 실패: {note}")
            print(f"기록: {tid} blocked (3회 연속 실패)")
        else:
            stamp(s, "fail", tid, f"{n}/3: {note}"); print(f"기록: {tid} 실패 {n}/3")
        save(s); return

    if a and a[0] == "--unblock":
        tid = a[1]
        for t in s["tasks"]:
            if t["id"] == tid: t["status"] = "todo"; t["blockedBy"] = []
        stamp(s, "unblock", tid, "수동 해제"); save(s); print(f"기록: {tid} todo"); return

    # ── 판정 ──
    if os.path.exists(STOP):
        print(f"STOP: .loop/STOP 존재 — {open(STOP, encoding='utf-8').read().strip()[:120]}"); return
    try:
        deadline = datetime.fromisoformat(s["stopAtLocal"])
    except Exception:
        print("STOP: stopAtLocal 파싱 실패 — 안전하게 중단"); return
    if now() >= deadline:
        print(f"STOP: 마감 시각 경과 ({s['stopAtLocal']})"); return
    if s["cycles"] >= s["maxCycles"]:
        print(f"STOP: 사이클 상한 도달 ({s['cycles']}/{s['maxCycles']})"); return

    # 키가 생겼으면 T7 자동 해제 (값은 보지 않는다)
    have = keys_present()
    if {"DATA_GO_KR_KEY"} & have and ("OPINET_KEY" in have or "KAMIS_KEY" in have):
        for t in s["tasks"]:
            if t["id"] == "T7-real-ingest" and t["status"] == "blocked":
                t["status"] = "todo"; t["blockedBy"] = []
                stamp(s, "unblock", t["id"], "키 감지 — 자동 해제")
    if "LAW_OC" in have:
        for t in s["tasks"]:
            if t["id"] == "T8-law-verify" and t["status"] == "blocked":
                t["status"] = "todo"; t["blockedBy"] = []
                stamp(s, "unblock", t["id"], "LAW_OC 감지 — 자동 해제")

    done = {t["id"] for t in s["tasks"] if t["status"] == "done"}
    nxt = next((t for t in s["tasks"]
                if t["status"] == "todo" and all(b in done for b in t["blockedBy"])), None)
    if not nxt:
        left = [t["id"] for t in s["tasks"] if t["status"] == "todo"]
        if left:
            print(f"STOP: 남은 태스크가 선행조건에 막혀 있음 — {left}")
        else:
            print("STOP: 모든 태스크 처리 완료 — LOOP.md §4 게이트 작성으로 넘어갈 것")
        save(s); return

    s["cycles"] += 1
    stamp(s, "pick", nxt["id"], f"cycle {s['cycles']}")
    save(s)
    print(f"NEXT: {nxt['id']}")
    print(f"제목: {nxt['title']}")
    print(f"사이클: {s['cycles']}/{s['maxCycles']} · 마감 {s['stopAtLocal']}")
    print(f"지시:\n{nxt['spec']}")

main()
