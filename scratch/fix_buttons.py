import sys

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

buttons_old = """            <>
              <button onClick={handleCreateOT} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors">
                <Wrench className="w-3.5 h-3.5" /> Créer un OT
              </button>
              <button onClick={handlePlanMaintenance} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-emerald-600 transition-colors">
                <Calendar className="w-3.5 h-3.5" /> Planifier maintenance
              </button>
              <button onClick={() => onSetActiveTab('historique')} className="px-4 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <History className="w-3.5 h-3.5" /> Consulter historique
              </button>
              <button className="px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="leading-none -mt-1 font-bold text-lg">...</span>
              </button>
              {can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                <button onClick={() => { onSetIsEditing(true); onSetFormData(activeEquipment || {}); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Modifier
                </button>
              )}
            </>"""

buttons_new = """            <>
              <button onClick={handleCreateOT} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-lg flex flex-col items-center justify-center leading-tight shadow-sm hover:bg-blue-700 transition-colors h-[42px] min-w-[70px]">
                <span>Créer</span>
                <span>un OT</span>
              </button>
              <button onClick={handlePlanMaintenance} className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold rounded-lg flex flex-col items-center justify-center leading-tight shadow-sm hover:bg-emerald-600 transition-colors h-[42px] min-w-[70px]">
                <span>Planifier</span>
                <span>maintenance</span>
              </button>
              <button onClick={() => onSetActiveTab('historique')} className="px-3 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-bold rounded-lg flex flex-col items-center justify-center leading-tight shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-[42px] min-w-[70px]">
                <span>Consulter</span>
                <span>historique</span>
              </button>
              <button className="px-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-[42px]">
                <span className="leading-none pb-1 font-bold text-lg">...</span>
              </button>
              {can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                <button onClick={() => { onSetIsEditing(true); onSetFormData(activeEquipment || {}); }} className="px-4 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors h-[42px]">
                  Modifier
                </button>
              )}
            </>"""

if buttons_old in code:
    code = code.replace(buttons_old, buttons_new)
    print("Replaced successfully!")
else:
    print("Could not find block to replace.")

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
