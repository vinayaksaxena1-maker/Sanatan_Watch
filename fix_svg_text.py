import glob
import re

files = glob.glob('src/components/*.tsx')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Look for text with fill="#C2410C"
    # We will remove fill="#C2410C" and add className="fill-[#C2410C] dark:fill-brand-accent"
    
    # regex to find <text ... fill="#C2410C" ...>
    # It might already have a className or not.
    # The safest way is to just replace fill="#C2410C" with className="fill-[#C2410C] dark:fill-brand-accent"
    # Note: If it already has className, this will add a second className, which is invalid JSX.
    # So let's check carefully.
    
    # We'll just run a simple replacement and fix className merging.
    new_content = re.sub(r'fill="#C2410C"', r'className="fill-[#C2410C] dark:fill-brand-accent"', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
