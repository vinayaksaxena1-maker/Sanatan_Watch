import os
import re
import glob

# Mappings to literal hex values for Tailwind arbitrary variants
REPLACEMENTS = {
    'dark:bg-dark-card': 'dark:bg-[#1F2937]',
    'dark:bg-dark-control': 'dark:bg-[#273449]',
    'dark:hover:bg-dark-control': 'dark:hover:bg-[#273449]',
    'dark:border-dark-border': 'dark:border-[#475569]',
    'dark:text-dark-text-pri': 'dark:text-[#F9FAFB]',
    'dark:text-dark-text-sec': 'dark:text-[#CBD5E1]',
    'dark:text-dark-text-mut': 'dark:text-[#94A3B8]',
    'dark:text-dark-accent': 'dark:text-[#F59E0B]',
    'dark:bg-dark-sel-bg': 'dark:bg-[#422006]',
    'dark:text-dark-sel-text': 'dark:text-[#FEF3C7]',
}

# Leftover patterns
PATTERNS = [
    (re.compile(r'dark:border-(zinc|slate|orange|amber)-[0-9]+(/[0-9]+)?'), 'dark:border-[#475569]'),
    (re.compile(r'dark:bg-(zinc|slate|orange|amber)-[0-9]+(/[0-9]+)?'), 'dark:bg-[#1F2937]'),
    (re.compile(r'dark:hover:bg-(zinc|slate|orange)-[0-9]+(/[0-9]+)?'), 'dark:hover:bg-[#273449]'),
    (re.compile(r'dark:text-(slate|zinc|gray)-(50|100|200)'), 'dark:text-[#F9FAFB]'),
    (re.compile(r'dark:text-(slate|zinc|gray)-(300|350)'), 'dark:text-[#CBD5E1]'),
    (re.compile(r'dark:text-(slate|zinc|gray)-(400|450|500)'), 'dark:text-[#94A3B8]'),
    (re.compile(r'dark:text-(orange|amber)-(400|500|600)'), 'dark:text-[#F59E0B]'),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    # First, standard literal string replacements
    for old, new in REPLACEMENTS.items():
        new_content = new_content.replace(old, new)
        
    # Then regex replacements for leftovers
    for pattern, replacement in PATTERNS:
        new_content = pattern.sub(replacement, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    files = glob.glob('src/components/*.tsx') + ['src/App.tsx']
    for f in files:
        process_file(f)
