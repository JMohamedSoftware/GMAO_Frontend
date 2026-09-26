import re

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
code = code.replace(
    "import { Settings2, Wrench, Save, Edit, Plus, Info, History, Calendar, Link, FileText, ClipboardList } from 'lucide-react';",
    "import { Settings2, Wrench, Save, Edit, Plus, Info, History, Calendar, Link as LinkIcon, FileText, ClipboardList, ShieldCheck, Building2, Tag, Layers, MapPin, AlertTriangle } from 'lucide-react';"
)
code = code.replace("<Link className=", "<LinkIcon className=")

# 2. Extract parts
toolbar_start = code.find("{/* Toolbar */}")
toolbar_end = code.find("{/* Form / Details Content */}")
form_start = code.find("{/* Photo & Main Identity */}")
localisation_start = code.find("{/* Localisation */}")
tabs_start = code.find("{/* Tabs for details */}")

# Replace Toolbar logic to only show when editing
old_toolbar = code[toolbar_start:toolbar_end]
new_toolbar = f"{{(isEditing || isAdding) && (\n{old_toolbar}\n)}}"
code = code[:toolbar_start] + new_toolbar + "\n      " + code[toolbar_end:]

# Prepare the read-only header to insert right before Form / Details Content 
# if not editing/adding
read_only_header = """
        {(!isEditing && !isAdding) && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row gap-6 mb-2">
              {/* Left: Images */}
              <div className="w-full xl:w-72 shrink-0 flex flex-col gap-2">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                  {activeEquipment?.photos?.[0] ? (
                    <img src={activeEquipment.photos[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Plus className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {activeEquipment?.photos?.slice(1).map((photo, i) => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                      <img src={photo} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="aspect-square bg-blue-50 border border-blue-200 border-dashed rounded-lg flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100 transition-colors">
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">Ajouter</span>
                  </div>
                </div>
              </div>
              
              {/* Right: Info */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-slate-500 font-bold text-sm">{activeEquipment?.id}</span>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mt-1">{activeEquipment?.name}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center justify-center">
                        <span className="leading-none -mt-1 font-bold text-lg">...</span>
                      </button>
                      {can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                        <button onClick={() => { onSetIsEditing(true); onSetFormData(activeEquipment || {}); }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-700">
                          <Edit className="w-3.5 h-3.5" /> Modifier
                        </button>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-md ${activeEquipment?.status === 'En panne' ? 'bg-rose-100 text-rose-700' : activeEquipment?.status === 'En maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {activeEquipment?.status || 'En service'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-y-6 gap-x-4 mt-6">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Settings2 className="w-3.5 h-3.5" /> Famille</label>
                    <div className="text-sm font-semibold text-slate-800">{activeEquipment?.category || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Layers className="w-3.5 h-3.5" /> Sous-famille</label>
                    <div className="text-sm font-semibold text-slate-800">{activeEquipment?.subFamily || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Tag className="w-3.5 h-3.5" /> Marque</label>
                    <div className="text-sm font-semibold text-slate-800">{activeEquipment?.brand || '-'}</div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Modèle</label>
                    <div className="text-sm font-semibold text-slate-800">{activeEquipment?.model || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">N° Série</label>
                    <div className="text-sm font-semibold text-slate-800">{activeEquipment?.serialNumber || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Année</label>
                    <div className="text-sm font-semibold text-slate-800">{activeEquipment?.commissionDate ? new Date(activeEquipment.commissionDate).getFullYear() : '-'}</div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><MapPin className="w-3.5 h-3.5" /> Emplacement</label>
                    <div className="text-sm font-semibold text-slate-800">{flatLocalisations.find(l => l.id === activeEquipment?.localisationId)?.nom || '-'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><Building2 className="w-3.5 h-3.5" /> Localisation</label>
                    <div className="text-sm font-semibold text-slate-800">
                      {(() => {
                        const loc = flatLocalisations.find(l => l.id === activeEquipment?.localisationId);
                        return loc ? loc.nom : '-';
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Criticité</label>
                    <div className={`text-sm font-semibold ${activeEquipment?.criticality === 'Critique' ? 'text-rose-600' : 'text-slate-800'}`}>{activeEquipment?.criticality || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
"""

form_details_content = code.find("{/* Form / Details Content */}")
form_content_div = code.find('<div className="p-5 flex flex-col gap-6">', form_details_content)
insert_pos = form_content_div + len('<div className="p-5 flex flex-col gap-6">')

code = code[:insert_pos] + read_only_header + "\n        {(isEditing || isAdding) && (\n          <>\n" + code[insert_pos:]

# Wrap the form parts
tabs_start = code.find("{/* Tabs for details */}")
code = code[:tabs_start] + "          </>\n        )}\n\n        " + code[tabs_start:]

# Fix the 'info' tab to have readonly and form versions
info_tab_start = code.find("{activeTab === 'info' && (")
info_tab_content_start = code.find('<div className="grid grid-cols-3 gap-4">', info_tab_start)
info_tab_content_end = code.find(')}', info_tab_content_start)

read_only_info = """
              <>
                {(!isEditing && !isAdding) ? (
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* General Info */}
                    <div className="flex-1 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <Settings2 className="w-4 h-4 text-primary" /> Informations générales
                      </h3>
                      <div className="grid grid-cols-2 gap-y-4 text-xs">
                        <div className="text-slate-500 font-medium">Code équipement</div>
                        <div className="font-semibold text-slate-800">{activeEquipment?.id}</div>
                        
                        <div className="text-slate-500 font-medium">Désignation</div>
                        <div className="font-semibold text-slate-800">{activeEquipment?.name}</div>
                        
                        <div className="text-slate-500 font-medium">Description</div>
                        <div className="font-medium text-slate-800">{activeEquipment?.description || '-'}</div>
                        
                        <div className="text-slate-500 font-medium">Statut</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold rounded ${activeEquipment?.status === 'En panne' ? 'bg-rose-100 text-rose-700' : activeEquipment?.status === 'En maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <ShieldCheck className="w-3 h-3 mr-1" /> {activeEquipment?.status || 'En service'}
                          </span>
                        </div>
                        
                        <div className="text-slate-500 font-medium">Date de mise en service</div>
                        <div className="font-semibold text-slate-800">{activeEquipment?.commissionDate ? new Date(activeEquipment.commissionDate).toLocaleDateString() : '-'}</div>
                        
                        <div className="text-slate-500 font-medium">Durée de vie estimée</div>
                        <div className="font-semibold text-slate-800">15 ans</div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="flex-1 flex flex-col gap-5">
                      <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                          <MapPin className="w-4 h-4 text-primary" /> Localisation
                        </h3>
                        <div className="flex gap-4">
                          <div className="flex-1 grid grid-cols-2 gap-y-4 text-xs">
                            <div className="text-slate-500 font-medium">Site</div>
                            <div className="font-semibold text-slate-800">
                              {(() => {
                                const loc = flatLocalisations.find(l => l.id === activeEquipment?.localisationId);
                                return loc ? loc.nom : '-';
                              })()}
                            </div>
                            
                            <div className="text-slate-500 font-medium">Atelier/Ligne</div>
                            <div className="font-semibold text-slate-800">Utilités</div>
                            
                            <div className="text-slate-500 font-medium">Emplacement</div>
                            <div className="font-semibold text-slate-800">{flatLocalisations.find(l => l.id === activeEquipment?.localisationId)?.nom || '-'}</div>
                          </div>
                          <div className="w-24 h-20 bg-slate-100 rounded-lg overflow-hidden relative flex flex-col border border-slate-200">
                            <div className="flex-1 bg-slate-200 flex items-center justify-center text-slate-400">
                               <MapPin className="w-6 h-6" />
                            </div>
                            <button className="bg-blue-50 text-blue-600 text-[10px] font-bold py-1 w-full text-center hover:bg-blue-100">Voir sur plan</button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                          <ClipboardList className="w-4 h-4 text-primary" /> Caractéristiques techniques
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 text-xs">
                          <div className="text-slate-500 font-medium">Puissance</div>
                          <div className="font-semibold text-slate-800">55 kW</div>
                          
                          <div className="text-slate-500 font-medium">Pression max</div>
                          <div className="font-semibold text-slate-800">8 bar</div>
                          
                          <div className="text-slate-500 font-medium">Débit</div>
                          <div className="font-semibold text-slate-800">9.5 m³/min</div>
                          
                          <div className="text-slate-500 font-medium">Tension</div>
                          <div className="font-semibold text-slate-800">400 V</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
"""

code = code[:info_tab_content_start] + read_only_info + code[info_tab_content_start:info_tab_content_end] + "\n                )}\n              </>" + code[info_tab_content_end:]

# Now insert buttons at the bottom
end_tabs = code.rfind("</div>", 0, code.rfind("</div>", 0, code.rfind("</div>")))
bottom_buttons = """
        {(!isAdding && !isEditing) && (
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3">
             <button onClick={handleCreateOT} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors">
                <Wrench className="w-4 h-4" /> Créer un OT
             </button>
             <button onClick={handlePlanMaintenance} className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-emerald-600 transition-colors">
                <Calendar className="w-4 h-4" /> Planifier maintenance
             </button>
             <button onClick={() => onSetActiveTab('historique')} className="px-5 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <History className="w-4 h-4" /> Consulter historique
             </button>
          </div>
        )}
"""

# Actually it is better to just append it before the very last 3 </div> tags.
last_div = code.rfind("</div>\n    </div>\n  );\n};")
code = code[:last_div] + bottom_buttons + code[last_div:]

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Replacement done.")
