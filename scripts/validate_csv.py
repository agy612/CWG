import csv
from collections import defaultdict

input_file = '/Users/jiyong/Desktop/CWG-main/locales/translations.csv'

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    rows = list(reader)

print(f"📊 CSV 통계")
print(f"=" * 60)
print(f"총 번역 항목: {len([r for r in rows if len(r) > 3 and r[0].strip()])}개")
print(f"총 줄 수: {len(rows) + 1}줄 (헤더 포함)")
print()

# 페이지별 통계
page_counts = defaultdict(int)
for row in rows:
    if len(row) > 0 and row[0].strip():
        page_counts[row[0]] += 1

print(f"📑 페이지별 번역 항목 수:")
print(f"-" * 60)
for page in sorted(page_counts.keys()):
    print(f"  {page:20s}: {page_counts[page]:3d}개")

print()
print(f"✅ 영어 유지 항목 확인:")
print(f"-" * 60)
# MY 확인
for row in rows:
    if len(row) > 8 and row[0] == 'bottom_nav' and row[1] == 'my':
        print(f"  MY 탭: ko={row[3]}, ja={row[5]}, zh-CN={row[6]} ✓")
        
# 티어 확인
for row in rows:
    if len(row) > 8 and row[0] == 'tier':
        if all(row[i] in ['GUEST', 'FREE', 'STANDARD', 'PRO'] for i in [3,4,5,6,7,8] if i < len(row)):
            print(f"  {row[1]:15s}: 모든 언어 = {row[3]} ✓")

# P 확인
for row in rows:
    if len(row) > 8 and row[0] == 'common' and row[1] == 'point':
        if all(row[i] == 'P' for i in [3,4,5,6,7,8] if i < len(row)):
            print(f"  포인트 단위: 모든 언어 = P ✓")

print()
print(f"🌍 지원 언어: {', '.join(header[3:])}")
