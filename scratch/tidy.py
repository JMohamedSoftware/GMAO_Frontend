import sys

with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Fix the top grid (make values larger and bolder)
# The top grid starts with: <div className="grid grid-cols-3 gap-y-6 gap-x-4 mt-2">
# We need to change "text-sm font-semibold text-slate-800" to "text-[15px] sm:text-base font-bold text-slate-900"
code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">{activeEquipment?.category || '-'}</div>""",
    """<div className="text-[15px] font-bold text-slate-900">{activeEquipment?.category || '-'}</div>"""
)
code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">{activeEquipment?.subFamily || '-'}</div>""",
    """<div className="text-[15px] font-bold text-slate-900">{activeEquipment?.subFamily || '-'}</div>"""
)
code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">{activeEquipment?.brand || '-'}</div>""",
    """<div className="text-[15px] font-bold text-slate-900">{activeEquipment?.brand || '-'}</div>"""
)
code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">{activeEquipment?.model || '-'}</div>""",
    """<div className="text-[15px] font-bold text-slate-900">{activeEquipment?.model || '-'}</div>"""
)
code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">{activeEquipment?.serialNumber || '-'}</div>""",
    """<div className="text-[15px] font-bold text-slate-900">{activeEquipment?.serialNumber || '-'}</div>"""
)
code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">{activeEquipment?.commissionDate ? new Date(activeEquipment.commissionDate).getFullYear() : '-'}</div>""",
    """<div className="text-[15px] font-bold text-slate-900">{activeEquipment?.commissionDate ? new Date(activeEquipment.commissionDate).getFullYear() : '-'}</div>"""
)

code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">{flatLocalisations.find(l => l.id === activeEquipment?.localisationId)?.nom || '-'}</div>""",
    """<div className="text-[15px] font-bold text-slate-900 truncate pr-2">{flatLocalisations.find(l => l.id === activeEquipment?.localisationId)?.nom || '-'}</div>"""
)
code = code.replace(
    """<div className="text-sm font-semibold text-slate-800">
                      {(() => {""",
    """<div className="text-[15px] font-bold text-slate-900 truncate pr-2">
                      {(() => {"""
)
code = code.replace(
    """<div className={`text-sm font-semibold ${activeEquipment?.criticality === 'Critique' ? 'text-rose-600' : 'text-slate-800'}`}>{activeEquipment?.criticality || '-'}</div>""",
    """<div className={`text-[15px] font-bold ${activeEquipment?.criticality === 'Critique' ? 'text-rose-600' : 'text-slate-900'}`}>{activeEquipment?.criticality || '-'}</div>"""
)

# 2. Fix the overlapping in the "Localisation" section
loc_old = """                          <div className="flex-1 grid grid-cols-2 gap-y-4 text-xs">
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
                          </div>"""

loc_new = """                          <div className="flex-1 flex flex-col gap-4 text-[13px]">
                            <div className="grid grid-cols-[100px_1fr] items-center">
                              <div className="text-slate-500 font-medium">Site</div>
                              <div className="font-bold text-slate-900 truncate">
                                {(() => {
                                  const loc = flatLocalisations.find(l => l.id === activeEquipment?.localisationId);
                                  return loc ? loc.nom : '-';
                                })()}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-[100px_1fr] items-center">
                              <div className="text-slate-500 font-medium">Atelier/Ligne</div>
                              <div className="font-bold text-slate-900 truncate">Utilités</div>
                            </div>
                            
                            <div className="grid grid-cols-[100px_1fr] items-center">
                              <div className="text-slate-500 font-medium truncate pr-2">Emplacement</div>
                              <div className="font-bold text-slate-900 truncate">{flatLocalisations.find(l => l.id === activeEquipment?.localisationId)?.nom || '-'}</div>
                            </div>
                          </div>"""
if loc_old in code:
    code = code.replace(loc_old, loc_new)
else:
    print("Could not find loc_old")

# 3. Fix the "Informations générales" left block to be bold and structured better
info_gen_old = """                      <div className="grid grid-cols-2 gap-y-4 text-xs">
                        <div className="text-slate-500 font-medium">Code équipement</div>
                        <div className="font-semibold text-slate-800">{activeEquipment?.id}</div>
                        
                        <div className="text-slate-500 font-medium">Désignation</div>
                        <div className="font-semibold text-slate-800">{activeEquipment?.name}</div>
                        
                        <div className="text-slate-500 font-medium">Description</div>
                        <div className="font-medium text-slate-800 pr-4">{(activeEquipment as any)?.description || "Compresseur d'air à vis lubrifiée utilisé pour l'alimentation en air comprimé des lignes de production."}</div>
                        
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
                      </div>"""

info_gen_new = """                      <div className="grid grid-cols-[140px_1fr] gap-y-5 text-[13px]">
                        <div className="text-slate-500 font-medium">Code équipement</div>
                        <div className="font-bold text-slate-900">{activeEquipment?.id}</div>
                        
                        <div className="text-slate-500 font-medium">Désignation</div>
                        <div className="font-bold text-slate-900">{activeEquipment?.name}</div>
                        
                        <div className="text-slate-500 font-medium">Description</div>
                        <div className="font-medium text-slate-800 pr-4 leading-relaxed">{(activeEquipment as any)?.description || "Compresseur d'air à vis lubrifiée utilisé pour l'alimentation en air comprimé des lignes de production."}</div>
                        
                        <div className="text-slate-500 font-medium">Statut</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 text-[11px] font-bold rounded ${activeEquipment?.status === 'En panne' ? 'bg-rose-100 text-rose-700' : activeEquipment?.status === 'En maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {activeEquipment?.status || 'En service'}
                          </span>
                        </div>
                        
                        <div className="text-slate-500 font-medium">Date de mise en service</div>
                        <div className="font-bold text-slate-900">{activeEquipment?.commissionDate ? new Date(activeEquipment.commissionDate).toLocaleDateString() : '-'}</div>
                        
                        <div className="text-slate-500 font-medium">Durée de vie estimée</div>
                        <div className="font-bold text-slate-900">15 ans</div>
                      </div>"""
if info_gen_old in code:
    code = code.replace(info_gen_old, info_gen_new)
else:
    print("Could not find info_gen_old")
    
# 4. Fix Caractéristiques techniques text size
carac_old = """                        <div className="grid grid-cols-2 gap-y-4 text-xs">
                          <div className="text-slate-500 font-medium">Puissance</div>
                          <div className="font-semibold text-slate-800">55 kW</div>
                          
                          <div className="text-slate-500 font-medium">Pression max</div>
                          <div className="font-semibold text-slate-800">8 bar</div>
                          
                          <div className="text-slate-500 font-medium">Débit</div>
                          <div className="font-semibold text-slate-800">9.5 m³/min</div>
                          
                          <div className="text-slate-500 font-medium">Tension</div>
                          <div className="font-semibold text-slate-800">400 V</div>
                        </div>"""

carac_new = """                        <div className="grid grid-cols-[100px_1fr] gap-y-4 text-[13px]">
                          <div className="text-slate-500 font-medium">Puissance</div>
                          <div className="font-bold text-slate-900">55 kW</div>
                          
                          <div className="text-slate-500 font-medium">Pression max</div>
                          <div className="font-bold text-slate-900">8 bar</div>
                          
                          <div className="text-slate-500 font-medium">Débit</div>
                          <div className="font-bold text-slate-900">9.5 m³/min</div>
                          
                          <div className="text-slate-500 font-medium">Tension</div>
                          <div className="font-bold text-slate-900">400 V</div>
                        </div>"""
if carac_old in code:
    code = code.replace(carac_old, carac_new)
else:
    print("Could not find carac_old")


with open('src/features/company/equipments/components/EquipmentDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Tidying done.")
