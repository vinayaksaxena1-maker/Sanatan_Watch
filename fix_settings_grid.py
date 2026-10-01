filepath = 'src/components/SettingsScreen.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Change grid-cols-2 to grid-cols-3
content = content.replace('<div className="grid grid-cols-2 gap-2">', '<div className="grid grid-cols-3 gap-2">')

# We'll use regex to find the dark button and duplicate it for midnight
import re
match = re.search(r'(<button[^>]+onClick\{\(\) => handleChangeTheme\(\'dark\'\)\}[^>]+>.*?</button>)', content, re.DOTALL)
if match:
    dark_btn = match.group(1)
    
    # Create the midnight button
    midnight_btn = dark_btn.replace("'dark'", "'midnight-saffron'")
    midnight_btn = midnight_btn.replace('theme === \'dark\'', 'theme === \'midnight-saffron\'')
    midnight_btn = midnight_btn.replace("getTranslation(language, 'themeDark')", "language === 'Hindi' ? '???????' : 'Midnight'")
    
    content = content.replace(dark_btn, dark_btn + '\n\n                  ' + midnight_btn)
    print("Injected Midnight Saffron button")
else:
    print("Could not find dark button")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
