import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace 'text-slate-400' with 'text-slate-400 dark:text-[#94A3B8]' 
    # ONLY if 'dark:text' is not already on that line.
    
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if 'className=' in line or 'class=' in line or '' in line or "'" in line or '"' in line:
            # If line doesn't have dark:text-
            if 'dark:text' not in line:
                line = re.sub(r'\btext-slate-400\b', r'text-slate-400 dark:text-[#94A3B8]', line)
                line = re.sub(r'\btext-stone-500\b', r'text-stone-500 dark:text-[#94A3B8]', line)
                line = re.sub(r'\btext-slate-500\b', r'text-slate-500 dark:text-[#CBD5E1]', line)
                line = re.sub(r'\btext-slate-600\b', r'text-slate-600 dark:text-[#CBD5E1]', line)
                line = re.sub(r'\btext-slate-700\b', r'text-slate-700 dark:text-[#F9FAFB]', line)
                line = re.sub(r'\btext-slate-800\b', r'text-slate-800 dark:text-[#F9FAFB]', line)
                line = re.sub(r'\btext-slate-900\b', r'text-slate-900 dark:text-[#F9FAFB]', line)
                line = re.sub(r'\btext-slate-750\b', r'text-slate-750 dark:text-[#CBD5E1]', line)
                line = re.sub(r'\btext-slate-450\b', r'text-slate-450 dark:text-[#94A3B8]', line)
                
            # If line doesn't have dark:bg-
            if 'dark:bg' not in line:
                line = re.sub(r'\bbg-slate-500/5\b', r'bg-slate-500/5 dark:bg-[#1F2937]', line)
                line = re.sub(r'\bbg-white/70\b', r'bg-white/70 dark:bg-[#1F2937]', line)
                line = re.sub(r'\bbg-slate-50\b', r'bg-slate-50 dark:bg-[#1F2937]', line)
                line = re.sub(r'\bbg-orange-500/5\b', r'bg-orange-500/5 dark:bg-[#1F2937]', line)
                line = re.sub(r'\bbg-orange-50/20\b', r'bg-orange-50/20 dark:bg-[#1F2937]', line)
                line = re.sub(r'\bbg-orange-100\b', r'bg-orange-100 dark:bg-[#273449]', line)

            # Check borders
            if 'dark:border' not in line:
                line = re.sub(r'\bborder-slate-200\b', r'border-slate-200 dark:border-[#475569]', line)
                line = re.sub(r'\bborder-slate-200/55\b', r'border-slate-200/55 dark:border-[#475569]', line)
                line = re.sub(r'\bborder-orange-100(/[0-9]+)?\b', r'border-orange-100\1 dark:border-[#475569]', line)
                line = re.sub(r'\bborder-orange-200\b', r'border-orange-200 dark:border-[#475569]', line)

        new_lines.append(line)
        
    new_content = '\n'.join(new_lines)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    files = glob.glob('src/components/*.tsx') + ['src/App.tsx']
    for f in files:
        process_file(f)
