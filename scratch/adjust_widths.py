import sys

# 1. GeoTree.tsx
with open('src/features/company/equipments/components/GeoTree.tsx', 'r', encoding='utf-8') as f:
    geotree_code = f.read()

geotree_code = geotree_code.replace('w-[280px]', 'w-[220px]')
with open('src/features/company/equipments/components/GeoTree.tsx', 'w', encoding='utf-8') as f:
    f.write(geotree_code)

# 2. EquipmentList.tsx
with open('src/features/company/equipments/components/EquipmentList.tsx', 'r', encoding='utf-8') as f:
    list_code = f.read()

list_code = list_code.replace('w-[380px]', 'w-[300px]')
with open('src/features/company/equipments/components/EquipmentList.tsx', 'w', encoding='utf-8') as f:
    f.write(list_code)

# 3. EquipmentDetails.tsx
with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'r', encoding='utf-8') as f:
    details_code = f.read()

details_code = details_code.replace('w-[280px]', 'w-[230px]')
with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(details_code)

print("Adjusted panel widths to avoid squishing.")
