# 아침 인제스트 절차 (D1 게이트)

1. `.env.local`에 `DATA_GO_KR_KEY=디코딩키` 저장
2. 실호출 검증 (필드 확정 — 추측 금지):
   - 단지 목록: `apis.data.go.kr/1613000/AptListService2/getSidoAptList`
   - 기본 정보: `AptBasisInfoService/getAphusBassInfo` (연식·세대수·난방 필드 확인)
   - 장충금·관리비 서비스: 응답 XML/JSON에서 월별 시계열·㎡당 단가 존재 확인
3. **게이트 판정**: 장충금 월별 필드가 API에 있으면 → API 증분 경로. 없으면 → K-apt 파일데이터(CSV) 다운로드 경로
4. 통과 시 lib/data/kapt.ts 구현 + Supabase 적재 (스키마: docs/40-DESIGN §3)
5. 실패 시(둘 다 불가) → 40-DESIGN 폴백: 수백 단지 수동 CSV로 축소
