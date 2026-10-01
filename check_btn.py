filepath = 'src/components/SettingsScreen.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Print surrounding of handleChangeTheme('dark')
idx = content.find("handleChangeTheme('dark')")
if idx != -1:
    print(content[idx-200:idx+300])
else:
    print('Not found')
