filepath = 'src/index.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .dark html, .dark body
content = content.replace('.dark html, .dark body {\n  color: #F9FAFB; /* Primary text */\n  background-color: #1A2433;\n}', 
'.dark html, .dark body {\n  color: var(--brand-text-pri);\n  background-color: var(--brand-bg);\n}')

# Add new @theme block and variable definitions
theme_block = '''
@theme {
  --color-brand-bg: var(--brand-bg);
  --color-brand-card: var(--brand-card);
  --color-brand-control: var(--brand-control);
  --color-brand-border: var(--brand-border);
  --color-brand-text-pri: var(--brand-text-pri);
  --color-brand-text-sec: var(--brand-text-sec);
  --color-brand-text-mut: var(--brand-text-mut);
  --color-brand-accent: var(--brand-accent);
  --color-brand-sel-bg: var(--brand-sel-bg);
  --color-brand-sel-text: var(--brand-sel-text);
}

.dark {
  --brand-bg: #1A2433;
  --brand-card: #243244;
  --brand-control: #2E3D52;
  --brand-border: #475569;
  --brand-text-pri: #F9FAFB;
  --brand-text-sec: #CBD5E1;
  --brand-text-mut: #94A3B8;
  --brand-accent: #F59E0B;
  --brand-sel-bg: #422006;
  --brand-sel-text: #FEF3C7;
}

.theme-midnight {
  --brand-bg: #17212F;
  --brand-card: #222F40;
  --brand-control: #2D3B4E;
  --brand-border: #435267;
  --brand-text-pri: #F8FAFC;
  --brand-text-sec: #CBD5E1;
  --brand-text-mut: #AAB7C7;
  --brand-accent: #F59E0B;
  --brand-sel-bg: #422006;
  --brand-sel-text: #FEF3C7;
}
'''
content = content.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + theme_block)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated index.css')
