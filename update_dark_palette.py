import os
import glob

# Mappings for the new dark mode background palette
REPLACEMENTS = {
    'dark:bg-[#111827]': 'dark:bg-[#1A2433]',
    'dark:bg-[#1F2937]': 'dark:bg-[#243244]',
    'dark:bg-[#273449]': 'dark:bg-[#2E3D52]',
    'dark:hover:bg-[#273449]': 'dark:hover:bg-[#2E3D52]',
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
