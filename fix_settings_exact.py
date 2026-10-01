filepath = 'src/components/SettingsScreen.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<div className="grid grid-cols-2 gap-2">', '<div className="grid grid-cols-3 gap-2">')

old_dark_btn = '''                  <button
                    type="button"
                    onClick={() => handleChangeTheme('dark')}
                    className={py-2 px-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative }
                  >
                    {settings.theme === 'dark' && <Check className="w-3 h-3 absolute top-1.5 right-1.5 text-white dark:text-brand-accent" />}
                    <Moon className={w-3.5 h-3.5 } />
                    <span>{getTranslation(language, 'themeDark')}</span>
                  </button>'''

new_midnight_btn = '''
                  <button
                    type="button"
                    onClick={() => handleChangeTheme('midnight-saffron')}
                    className={py-2 px-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative }
                  >
                    {settings.theme === 'midnight-saffron' && <Check className="w-3 h-3 absolute top-1.5 right-1.5 text-white dark:text-brand-accent" />}
                    <Moon className={w-3.5 h-3.5 } />
                    <span>{language === 'Hindi' ? '???????' : 'Midnight'}</span>
                  </button>'''

content = content.replace(old_dark_btn, old_dark_btn + new_midnight_btn)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced exact string')
