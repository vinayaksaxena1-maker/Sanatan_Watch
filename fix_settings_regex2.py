filepath = 'src/components/SettingsScreen.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
pattern = re.compile(r'(<button[^>]*?onClick=\{\(\) => handleChangeTheme\(\'dark\'\)\}.*?</button>)', re.DOTALL)
match = pattern.search(content)
if match:
    dark_btn = match.group(1)
    
    # Generate the midnight button from it
    midnight_btn = dark_btn.replace("'dark'", "'midnight-saffron'")
    midnight_btn = midnight_btn.replace('theme === \'dark\'', 'theme === \'midnight-saffron\'')
    midnight_btn = midnight_btn.replace("getTranslation(language, 'themeDark')", "language === 'Hindi' ? '???????' : 'Midnight'")
    
    # Replace the dark button with dark_btn + new_btn
    content = content.replace(dark_btn, dark_btn + '\n\n                ' + midnight_btn)
    print("Injected button")
else:
    print("Could not find dark button")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
