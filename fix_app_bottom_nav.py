filepath = 'src/App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'bg-[#1F2937]/95", "'bg-[#243244]/95")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated App.tsx bottom nav')
