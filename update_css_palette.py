filepath = 'src/index.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('background-color: #111827;', 'background-color: #1A2433;')
content = content.replace('--color-dark-app: #111827;', '--color-dark-app: #1A2433;')
content = content.replace('--color-dark-card: #1F2937;', '--color-dark-card: #243244;')
content = content.replace('--color-dark-control: #273449;', '--color-dark-control: #2E3D52;')
content = content.replace('--bg-app-dark-start: #111827;', '--bg-app-dark-start: #1A2433;')
content = content.replace('--bg-app-dark-mid: #111827;', '--bg-app-dark-mid: #1A2433;')
content = content.replace('--bg-app-dark-end: #111827;', '--bg-app-dark-end: #1A2433;')
content = content.replace('--bg-envelope-dark: #1F2937;', '--bg-envelope-dark: #243244;')
content = content.replace('--card-bg-dark: #1F2937;', '--card-bg-dark: #243244;')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated index.css')
