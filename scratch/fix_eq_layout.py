import sys

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Fix the Top Section layout (Image & Header grid)
top_section_old = """          <div className="flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row gap-6 mb-2">
              {/* Left: Images */}
              <div className="w-full xl:w-72 shrink-0 flex flex-col gap-2">"""

top_section_new = """          <div className="flex flex-col gap-6">
            <div className="flex gap-6 mb-2">
              {/* Left: Images */}
              <div className="w-[280px] shrink-0 flex flex-col gap-2">"""
if top_section_old in code:
    code = code.replace(top_section_old, top_section_new)
else:
    print("Could not find top_section_old")

# 2. Fix the tabs gap and make them smaller if needed, but it's okay.
# Let's fix the "Informations générales" block layout to ensure it doesn't wrap weirdly.
info_gen_old = """                {(!isEditing && !isAdding) ? (
                  <div className="flex flex-col md:flex-row gap-5 mt-4">
                    {/* General Info */}
                    <div className="flex-1 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">"""

info_gen_new = """                {(!isEditing && !isAdding) ? (
                  <div className="flex gap-5 mt-4">
                    {/* General Info */}
                    <div className="flex-1 min-w-0 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">"""
if info_gen_old in code:
    code = code.replace(info_gen_old, info_gen_new)
else:
    print("Could not find info_gen_old")

# 3. Add min-w-0 to right column
right_col_old = """                    {/* Right column */}
                    <div className="flex-1 flex flex-col gap-5">"""
right_col_new = """                    {/* Right column */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5">"""
if right_col_old in code:
    code = code.replace(right_col_old, right_col_new)
else:
    print("Could not find right_col_old")

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("EquipmentDetails layout fixed.")
