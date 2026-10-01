filepath = 'src/types.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("theme: 'light' | 'dark';", "theme: 'light' | 'dark' | 'midnight-saffron';")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated types.ts')
