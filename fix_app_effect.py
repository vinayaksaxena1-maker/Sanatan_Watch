filepath = 'src/App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the useEffect logic for theme
old_effect = '''  // Sync document class with current settings theme for Tailwind dark mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.classList.remove('temple');
    }
  }, [settings.theme]);'''

new_effect = '''  // Sync document class with current settings theme for Tailwind dark mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'theme-midnight', 'temple');
      
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'midnight-saffron') {
        root.classList.add('dark', 'theme-midnight');
      }
    }
  }, [settings.theme]);'''

if old_effect in content:
    content = content.replace(old_effect, new_effect)
    print('Updated App.tsx theme effect')
else:
    print('Could not find old effect in App.tsx')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
