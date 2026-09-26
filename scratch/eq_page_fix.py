import sys

with open('src/features/company/equipments/pages/EquipmentPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Fix Imports
if "import { Settings2, Plus, Package } from 'lucide-react';" in code:
    code = code.replace(
        "import { Settings2, Plus, Package } from 'lucide-react';",
        "import { Settings2, Plus, Package, Download, Upload, MoreHorizontal, Layers, Activity, AlertTriangle, Wrench, Coins } from 'lucide-react';"
    )
else:
    print("Could not find lucide-react import")

# 2. Fix Header Buttons
header_buttons_old = """        <div className="flex items-center gap-2">
          {can(PERMISSIONS.EQUIPMENT_CREATE) && (
            <button 
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm hover-lift"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Équipement</span>
            </button>
          )}
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            Importer
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            Exporter
          </button>
          <button className="px-3 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>"""

header_buttons_new = """        <div className="flex items-center gap-2">
          {can(PERMISSIONS.EQUIPMENT_CREATE) && (
            <button 
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Équipement</span>
            </button>
          )}
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Upload className="w-4 h-4" /> Importer
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button className="px-3 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>"""
if header_buttons_old in code:
    code = code.replace(header_buttons_old, header_buttons_new)
else:
    print("Could not find header buttons")

# 3. Fix KPIs
kpi_old = """      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Équipements</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">{totalEqs}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">↑ +12% ce mois</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En Service</p>
            <p className="text-2xl font-black text-emerald-600 leading-none mt-1">{enService}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((enService/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hors Service</p>
            <p className="text-2xl font-black text-rose-600 leading-none mt-1">{horsService}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((horsService/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-lg shrink-0">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En Maintenance</p>
            <p className="text-2xl font-black text-purple-600 leading-none mt-1">{enMaintenance}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((enMaintenance/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valeur Estimée</p>
            <p className="text-2xl font-black text-amber-600 leading-none mt-1">{(totalEqs * 15000).toLocaleString('fr-FR')} €</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">Estimative moyenne</p>
          </div>
        </div>
      </div>"""

kpi_new = """      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Total Équipements</p>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{totalEqs}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">↑ +12% ce mois</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg shrink-0">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">En Service</p>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{enService}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((enService/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Hors Service</p>
            <p className="text-xl font-black text-rose-600 leading-none">{horsService}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((horsService/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">En Maintenance</p>
            <p className="text-xl font-black text-purple-600 leading-none">{enMaintenance}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{totalEqs ? Math.round((enMaintenance/totalEqs)*100) : 0}% du parc</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Valeur du Parc</p>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{(totalEqs * 15000).toLocaleString('fr-FR')} €</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">↑ +3% ce mois</p>
          </div>
        </div>
      </div>"""
if kpi_old in code:
    code = code.replace(kpi_old, kpi_new)
else:
    print("Could not find KPI block")

with open('src/features/company/equipments/pages/EquipmentPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("EquipmentPage updated.")
