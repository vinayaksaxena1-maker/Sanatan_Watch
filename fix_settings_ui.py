filepath = 'src/components/SettingsScreen.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the handleChangeTheme accept the new string
content = content.replace("handleChangeTheme = (theme: 'light' | 'dark')", "handleChangeTheme = (theme: 'light' | 'dark' | 'midnight-saffron')")

# The existing UI has two buttons for Light/Dark. Let's find it.
# We'll use regex to inject the third button.
import re
match = re.search(r'(<button[^>]+onClick\{\(\) => handleChangeTheme\(\'dark\'\)\}[^>]+>.*?</button>)', content, re.DOTALL)
if match:
    dark_btn = match.group(1)
    
    # Create the midnight button by replacing 'dark' with 'midnight-saffron' and the icon/text.
    # It probably uses <Moon className="w-5 h-5 ... /> and "Dark Mode"
    midnight_btn = dark_btn.replace("'dark'", "'midnight-saffron'")
    midnight_btn = midnight_btn.replace('Dark Mode', 'Midnight')
    midnight_btn = midnight_btn.replace('????? ???', '???????')
    
    # We also need to change the condition for settings.theme === 'dark' to settings.theme === 'midnight-saffron' in the class names.
    midnight_btn = midnight_btn.replace("theme === 'dark'", "theme === 'midnight-saffron'")
    
    # Let's just insert it after the dark button
    content = content.replace(dark_btn, dark_btn + '\n                  ' + midnight_btn)
    print("Injected Midnight Saffron button")
else:
    print("Could not find dark button")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
