import re

filepath = 'src/App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Bottom Nav Background
content = content.replace("'bg-[#1D1713]/95 backdrop-blur-md border-[var(--card-border-dark)]'", "'bg-[#1F2937]/95 backdrop-blur-md border-[#475569]'")

# Fix Bottom Nav Active Tab (text-orange-655 -> dark:text-[#F59E0B] dark:bg-[#422006])
content = content.replace("'text-orange-655 font-extrabold scale-102 bg-orange-500/10'", "'text-orange-655 dark:text-[#F59E0B] font-extrabold scale-102 bg-orange-500/10 dark:bg-[#422006]'")

# Fix Bottom Nav Inactive Tab (text-slate-400 -> dark:text-[#94A3B8])
content = content.replace("'text-slate-400 hover:text-slate-500'", "'text-slate-400 hover:text-slate-500 dark:text-[#94A3B8] dark:hover:text-[#F9FAFB]'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Bottom Nav in App.tsx")
