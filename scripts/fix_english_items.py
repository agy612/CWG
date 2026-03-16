import csv

# 영어로 유지해야 할 항목들
KEEP_ENGLISH = {
    ('bottom_nav', 'my'): 'MY',
    ('tier', 'guest'): 'GUEST',
    ('tier', 'free'): 'FREE', 
    ('tier', 'standard'): 'STANDARD',
    ('tier', 'pro'): 'PRO',
    ('tier', 'guest_label'): 'GUEST',
    ('tier', 'free_label'): 'FREE',
    ('tier', 'standard_label'): 'STANDARD',
    ('tier', 'pro_label'): 'PRO',
    ('common', 'point'): 'P',
}

input_file = '/Users/jiyong/Desktop/CWG-main/locales/translations.csv'
output_file = '/Users/jiyong/Desktop/CWG-main/locales/translations_fixed.csv'

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

# 헤더 확인
header = rows[0]
print(f"Header: {header}")

# 수정
for i, row in enumerate(rows[1:], 1):
    if len(row) < 9:
        continue
    
    page, key = row[0], row[1]
    
    if (page, key) in KEEP_ENGLISH:
        english_value = KEEP_ENGLISH[(page, key)]
        # ko, en, ja, zh-CN, zh-TW, es 모두 영어로
        for lang_idx in [3, 4, 5, 6, 7, 8]:
            if lang_idx < len(row):
                row[lang_idx] = english_value
        rows[i] = row
        print(f"Fixed ({page}, {key}): all languages -> {english_value}")

# 저장
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f"\nTotal rows: {len(rows)}")
print(f"Output saved to: {output_file}")
