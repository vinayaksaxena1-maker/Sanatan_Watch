import os
import re
import glob

# Tokens to replace with
TOKENS = {
    'text_pri': 'dark:text-dark-text-pri',
    'text_sec': 'dark:text-dark-text-sec',
    'text_mut': 'dark:text-dark-text-mut',
    'border': 'dark:border-dark-border',
    'accent': 'dark:text-dark-accent',
    'bg_card': 'dark:bg-dark-card',
    'bg_control': 'dark:bg-dark-control',
    'bg_sel': 'dark:bg-dark-sel-bg',
    'text_sel': 'dark:text-dark-sel-text',
}

# Regex patterns
PATTERNS = [
    # Primary Text
    (re.compile(r'dark:text-(slate|zinc|gray)-(100|200|300)'), TOKENS['text_pri']),
    (re.compile(r'dark:text-\[#F9FAFB\]'), TOKENS['text_pri']),
    (re.compile(r'dark:text-amber-100'), TOKENS['text_pri']),
    
    # Muted Text
    (re.compile(r'dark:text-(slate|zinc)-(400|500)'), TOKENS['text_mut']),
    (re.compile(r'dark:text-\[#94A3B8\]'), TOKENS['text_mut']),
    
    # Secondary Text (Anything 350, 450 - though 350 doesn't exist natively)
    (re.compile(r'dark:text-\[#CBD5E1\]'), TOKENS['text_sec']),
    
    # Borders
    (re.compile(r'dark:border-(zinc|slate|orange|amber)-(800|900|950|100|200)(/\d+)?'), TOKENS['border']),
    (re.compile(r'dark:border-\[#475569\]'), TOKENS['border']),
    
    # Accents
    (re.compile(r'dark:text-(amber|orange)-(400|500|600)'), TOKENS['accent']),
    (re.compile(r'dark:text-\[#F59E0B\]'), TOKENS['accent']),
    
    # Backgrounds - Panels/Cards
    (re.compile(r'dark:bg-(zinc|slate)-(900|950)(/\d+)?'), TOKENS['bg_card']),
    (re.compile(r'dark:bg-orange-950(/\d+)?'), TOKENS['bg_card']),
    (re.compile(r'dark:bg-\[#1F2937\]'), TOKENS['bg_card']),
    (re.compile(r'dark:bg-\[#1A120B\]'), TOKENS['bg_card']),
    
    # Backgrounds - Controls
    (re.compile(r'dark:hover:bg-(zinc|slate|orange)-(800|850|900)(/\d+)?'), 'dark:hover:bg-dark-control'),
    (re.compile(r'dark:hover:bg-\[#273449\]'), 'dark:hover:bg-dark-control'),
    
    # Selected State
    (re.compile(r'dark:bg-\[#422006\]'), TOKENS['bg_sel']),
    (re.compile(r'dark:text-\[#FEF3C7\]'), TOKENS['text_sel']),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
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
