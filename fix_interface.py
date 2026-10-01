filepath = 'src/components/MuhuratScreen.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add language to interface if not there
if 'language?: string;' not in content and 'language: string;' not in content:
    content = content.replace('onDateChange: (date: Date) => void;', 'onDateChange: (date: Date) => void;\n  language: "English" | "Hindi";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed interface')
