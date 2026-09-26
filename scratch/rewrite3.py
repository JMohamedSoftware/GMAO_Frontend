import sys

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if "ShieldCheck, Building2, Tag, Layers, MapPin, AlertTriangle" not in code:
    code = code.replace(
        "import { Settings2, Wrench, Save, Edit, Plus, Info, History, Calendar, Link, FileText, ClipboardList } from 'lucide-react';",
        "import { Settings2, Wrench, Save, Edit, Plus, Info, History, Calendar, Link as LinkIcon, FileText, ClipboardList, ShieldCheck, Building2, Tag, Layers, MapPin, AlertTriangle } from 'lucide-react';"
    )
    code = code.replace("<Link className=", "<LinkIcon className=")

# 2. Modify top toolbar (remove from read-only)
toolbar_old = """      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />
          {isAdding ? 'Nouvel Équipement' : 'Fiche Technique'}
        </h2>
        <div className="flex items-center gap-2">
          {(isEditing || isAdding) ? (
            <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 shadow-sm transition-colors h-11">
              <Save className="w-3.5 h-3.5" /> Enregistrer
            </button>
          ) : (
            can(PERMISSIONS.EQUIPMENT_UPDATE) && (
            <button onClick={() => { onSetIsEditing(true); onSetFormData(activeEquipment || {}); }} className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors h-11">
              Modifier
            </button>
            )
          )}
        </div>
      </div>"""

toolbar_new = """      {/* Toolbar (Only for editing/adding mode) */}
      {(isEditing || isAdding) && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            {isAdding ? 'Nouvel Équipement' : 'Modifier Fiche Technique'}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 shadow-sm transition-colors h-11">
              <Save className="w-3.5 h-3.5" /> Enregistrer
            </button>
          </div>
        </div>
      )}"""

if toolbar_old in code:
    code = code.replace(toolbar_old, toolbar_new)
else:
    print("Could not find toolbar_old")

# 3. Insert read-only header
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
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center justify-center h-10">
                      <span className="leading-none pb-1 font-bold text-lg">...</span>
                    </button>
                    {can(PERMISSIONS.EQUIPMENT_UPDATE) && (
                      <button onClick={() => { onSetIsEditing(true); onSetFormData(activeEquipment || {}); }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-blue-700 h-10">
                        <Edit className="w-3.5 h-3.5" /> Modifier
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 mb-6">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-md ${activeEquipment?.status === 'En panne' ? 'bg-rose-100 text-rose-700' : activeEquipment?.status === 'En maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {activeEquipment?.status || 'En service'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-y-6 gap-x-4 mt-2">
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

        {(isEditing || isAdding) && (
          <>
        {/* Photo & Main Identity */}"""
if "        {/* Photo & Main Identity */}" in code:
    code = code.replace("        {/* Photo & Main Identity */}", read_only_header)
else:
    print("Could not find photo & main identity")

# 4. Close the form BEFORE {/* Tabs for details */}
tabs_old = """        {/* Tabs for details */}"""
tabs_new = """          </>
        )}

        {/* Tabs for details */}"""
if tabs_old in code:
    code = code.replace(tabs_old, tabs_new)
else:
    print("Could not find tabs for details")

# 5. Modify info tab
info_old = """            {activeTab === 'info' && (
              <div className="grid grid-cols-3 gap-4">"""

info_new = """            {activeTab === 'info' && (
              <>
                {(!isEditing && !isAdding) ? (
                  <div className="flex flex-col md:flex-row gap-5 mt-4">
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
                        <div className="font-medium text-slate-800 pr-4">{activeEquipment?.description || "Compresseur d'air à vis lubrifiée utilisé pour l'alimentation en air comprimé des lignes de production."}</div>
                        
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
                          <Building2 className="w-4 h-4 text-primary" /> Localisation
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
                            <button className="bg-blue-50 text-blue-600 text-[10px] font-bold py-1.5 w-full text-center hover:bg-blue-100 transition-colors">Voir sur plan</button>
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
                  <div className="grid grid-cols-3 gap-4">"""

if info_old in code:
    code = code.replace(info_old, info_new)
else:
    print("Could not find info_old")

# 6. Close info tab correctly
info_close_old = """                </div>
              </div>
            )}
            
            {activeTab === 'historique' && ("""

info_close_new = """                </div>
              </div>
                )}
              </>
            )}
            
            {activeTab === 'historique' && ("""

if info_close_old in code:
    code = code.replace(info_close_old, info_close_new)
else:
    print("Could not find info_close_old")

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Rewrite 3 done successfully.")
