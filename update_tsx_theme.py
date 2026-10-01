import os
import glob
import re

# We will replace these specific hardcoded classes with our new semantic classes
REPLACEMENTS = {
    'dark:bg-[#1A2433]': 'dark:bg-brand-bg',
    'dark:bg-[#243244]': 'dark:bg-brand-card',
    'dark:bg-[#2E3D52]': 'dark:bg-brand-control',
    'dark:hover:bg-[#2E3D52]': 'dark:hover:bg-brand-control',
    'dark:border-[#475569]': 'dark:border-brand-border',
    'dark:text-[#F9FAFB]': 'dark:text-brand-text-pri',
    'dark:text-[#CBD5E1]': 'dark:text-brand-text-sec',
    'dark:text-[#94A3B8]': 'dark:text-brand-text-mut',
    'dark:text-[#F59E0B]': 'dark:text-brand-accent',
    'dark:bg-[#422006]': 'dark:bg-brand-sel-bg',
    'dark:text-[#FEF3C7]': 'dark:text-brand-sel-text',
    # And handle App.tsx specifically where bg is set dynamically:
    'bg-[#243244]/95': 'bg-brand-card/95',
    'bg-gradient-to-b from-[var(--bg-app-dark-start)] via-[var(--bg-app-dark-mid)] to-[var(--bg-app-dark-end)]': 'bg-brand-bg',
    'bg-[var(--bg-envelope-dark)]': 'bg-brand-bg',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in REPLACEMENTS.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    files = glob.glob('src/components/*.tsx') + ['src/App.tsx']
    for f in files:
        process_file(f)
