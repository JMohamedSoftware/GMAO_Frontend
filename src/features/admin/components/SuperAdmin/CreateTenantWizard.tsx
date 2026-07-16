import React, { useState } from 'react';
import { useGmao } from '../../../../hooks/useGmao';
import { Sparkles, X, ArrowLeft, ArrowRight, Check, CheckCircle2, Hourglass } from 'lucide-react';

interface CreateTenantWizardProps {
  show: boolean;
  onClose: () => void;
  plansConfig: { Basic: number, Premium: number, Enterprise: number };
}

export const CreateTenantWizard: React.FC<CreateTenantWizardProps> = ({ show, onClose, plansConfig }) => {
  const { registerTenant, approveTenant } = useGmao();

  const [currentStep, setCurrentStep] = useState(1);
  const [creationLoading, setCreationLoading] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Step 1: Corporate Registry
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [country, setCountry] = useState('Tunisie');
  const [city, setCity] = useState('Nabeul');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Step 2: Brand Identity
  const [logoUrl, setLogoUrl] = useState('/assets/default-logo.svg');
  const [primaryColor, setPrimaryColor] = useState('#EF4444');
  const [themeMode, setThemeMode] = useState<'Light' | 'Dark'>('Light');

  // Step 3: Workspace
  const [companySlug, setCompanySlug] = useState('');
  const [timezone, setTimezone] = useState('GMT+1');
  const [language, setLanguage] = useState('Français');
  const [currency, setCurrency] = useState('EUR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Step 4: Administrator
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Step 5: Subscription
  const [subPlan, setSubPlan] = useState<'Basic' | 'Premium' | 'Enterprise'>('Premium');
  const [storageLimit, setStorageLimit] = useState('50 GB');
  const [maxUsers, setMaxUsers] = useState(20);
  const [maxEquipment, setMaxEquipment] = useState(50);

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    setLegalName(val + " S.A.");
    setCompanySlug(val.toLowerCase().replace(/[^a-z0-9]/g, ''));
  };

  const handlePlanChange = (plan: 'Basic' | 'Premium' | 'Enterprise') => {
    setSubPlan(plan);
    if (plan === 'Basic') {
      setStorageLimit('10 GB');
      setMaxUsers(5);
      setMaxEquipment(15);
    } else if (plan === 'Premium') {
      setStorageLimit('50 GB');
      setMaxUsers(20);
      setMaxEquipment(50);
    } else {
      setStorageLimit('500 GB');
      setMaxUsers(100);
      setMaxEquipment(500);
    }
  };

  const handleWizardSubmit = () => {
    setCreationLoading(true);
    setTimeout(() => {
      registerTenant(companyName, `${companySlug}.platform.com`, adminEmail, 300, subPlan);
      
      setTimeout(() => {
        approveTenant(`tenant-${companySlug}`);
      }, 0);

      setCreationLoading(false);
      setCreationSuccess(true);
      
      setTimeout(() => {
        onClose();
        setCurrentStep(1);
        setCreationSuccess(false);
        setCompanyName('');
        setLegalName('');
        setAddress('');
        setPhone('');
        setTaxNumber('');
        setCompanySlug('');
        setAdminFirstName('');
        setAdminLastName('');
        setAdminEmail('');
        setAdminPassword('');
      }, 1500);
    }, 1500);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full bg-white/90 dark:bg-slate-900/90 glass-panel rounded-custom-xl border border-white/50 dark:border-slate-800 p-6 flex flex-col gap-5 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-850 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
              Créer une Nouvelle Entreprise (Tenant)
            </h3>
            <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Wizard Onboarding SaaS multi-tenant</span>
          </div>
          <button 
            onClick={() => { onClose(); setCurrentStep(1); }}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="grid grid-cols-6 gap-2 text-center text-[9px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          {[
            { step: 1, name: 'Infos' },
            { step: 2, name: 'Identité' },
            { step: 3, name: 'Workspace' },
            { step: 4, name: 'Admin' },
            { step: 5, name: 'Offre' },
            { step: 6, name: 'Synthèse' }
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center gap-1">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                currentStep === s.step 
                  ? 'bg-primary text-white' 
                  : currentStep > s.step 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > s.step ? '✓' : s.step}
              </span>
              <span className={currentStep === s.step ? 'text-primary font-black' : ''}>{s.name}</span>
            </div>
          ))}
        </div>

        {/* Steps Content Area */}
        <div className="flex-1 min-h-[250px] text-xs font-semibold text-slate-700 dark:text-slate-350">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-3.5 animate-[fadeIn_0.15s_ease-out]">
              <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Information de l'Entreprise</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Nom de la Conserverie *</label>
                  <input type="text" required value={companyName} onChange={(e) => handleCompanyNameChange(e.target.value)} placeholder="Ex: Sicam Tomates" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Raison Sociale *</label>
                  <input type="text" required value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Ex: Sicam S.A." className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Adresse Physique</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Zone Industrielle, Route de Tunis" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Matricule Fiscal *</label>
                  <input type="text" required value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="Ex: 1234567/A/M/000" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Pays</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Ville</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Téléphone Standard</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +216 72 100 200" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
              <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Identité de Marque & Thème</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">URL du Logo d'Entreprise</label>
                    <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/assets/logo.svg" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Couleur Primaire (Accent)</label>
                    <div className="flex gap-2.5 mt-1">
                      {[
                        { hex: '#EF4444', label: 'Tomate Red' },
                        { hex: '#10B981', label: 'Organic Teal' },
                        { hex: '#3B82F6', label: 'Cobalt Blue' },
                        { hex: '#F59E0B', label: 'Lemon Yellow' }
                      ].map(c => (
                        <button key={c.hex} type="button" onClick={() => setPrimaryColor(c.hex)} className={`w-7 h-7 rounded-full border-2 transition-transform ${primaryColor === c.hex ? 'scale-110 border-slate-800 dark:border-white shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c.hex }} title={c.label} />
                      ))}
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer rounded-full" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Thème par défaut</label>
                    <div className="flex gap-2 mt-1">
                      <button type="button" onClick={() => setThemeMode('Light')} className={`flex-1 py-1.5 rounded-lg border font-bold text-center transition ${themeMode === 'Light' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-450 hover:bg-slate-50'}`}>Mode Clair</button>
                      <button type="button" onClick={() => setThemeMode('Dark')} className={`flex-1 py-1.5 rounded-lg border font-bold text-center transition ${themeMode === 'Dark' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-450 hover:bg-slate-50'}`}>Mode Sombre</button>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl flex flex-col gap-3.5 shadow-inner">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Aperçu Espace Client</span>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-sm" style={{ backgroundColor: primaryColor }}>
                      {companyName ? companyName.slice(0, 2).toUpperCase() : 'CO'}
                    </div>
                    <div className="leading-none flex-1 min-w-0">
                      <h5 className="font-extrabold text-xs text-slate-850 dark:text-white truncate">{companyName || 'Nom Entreprise'}</h5>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{companySlug || 'slug'}.platform.com</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: primaryColor }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
              <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Workspace & Configuration Régionale</h4>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Adresse URL de l'Espace (Company Slug) *</label>
                <div className="flex items-stretch border border-slate-205 dark:border-slate-800 rounded-lg overflow-hidden bg-transparent">
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-450 border-r border-slate-205 dark:border-slate-800 font-mono text-[10px] flex items-center">https://</span>
                  <input type="text" required value={companySlug} onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} placeholder="nomslug" className="flex-1 p-2 outline-none bg-transparent font-mono dark:text-white" />
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-450 border-l border-slate-205 dark:border-slate-800 font-mono text-[10px] flex items-center">.platform.com</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Langue</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900">
                    <option value="Français">Français</option>
                    <option value="English">English</option>
                    <option value="العربية">العربية</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Fuseau Horaire</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900">
                    <option value="GMT+1">GMT+1 (Europe/Tunis)</option>
                    <option value="GMT+0">GMT+0 (London/UTC)</option>
                    <option value="GMT+2">GMT+2 (Paris/Cairo)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Devise</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900">
                    <option value="EUR">EUR (TND)</option>
                    <option value="TND">TND (DT)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Format Date</label>
                  <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-3.5 animate-[fadeIn_0.15s_ease-out]">
              <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Administrateur Espace Client</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Prénom *</label>
                  <input type="text" required value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} placeholder="Ex: Ahmed" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Nom *</label>
                  <input type="text" required value={adminLastName} onChange={(e) => setAdminLastName(e.target.value)} placeholder="Ex: Bensaid" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">E-mail de Connexion Admin *</label>
                <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Ex: admin@sicam.com" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Mot de Passe par défaut *</label>
                <input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white" />
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-3.5 animate-[fadeIn_0.15s_ease-out]">
              <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Abonnement & Restrictions</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'Basic', label: 'Starter', price: plansConfig.Basic, features: 'Core CMMS' },
                  { key: 'Premium', label: 'Professional', price: plansConfig.Premium, features: 'Advanced Analytics, LOTO' },
                  { key: 'Enterprise', label: 'Enterprise', price: plansConfig.Enterprise, features: 'Multi-site, Custom API, Dedicated VM' }
                ].map(p => (
                  <button key={p.key} type="button" onClick={() => handlePlanChange(p.key as any)} className={`p-3 bg-white/50 dark:bg-slate-900 border rounded-xl flex flex-col text-left justify-between h-32 transition hover-lift ${subPlan === p.key ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-800'}`}>
                    <div>
                      <span className="font-extrabold text-xs block text-slate-800 dark:text-white">{p.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold leading-snug">{p.features}</span>
                    </div>
                    <span className="font-black text-slate-800 dark:text-white text-sm font-mono mt-auto">{p.price} TND<span className="text-[9px] font-normal">/m</span></span>
                  </button>
                ))}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl grid grid-cols-3 gap-4 text-center mt-1">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Capacité Stockage</span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-xs block mt-0.5">{storageLimit}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Utilisateurs Max</span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-xs block mt-0.5">{maxUsers} comptes</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Équipements Max</span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-xs block mt-0.5">{maxEquipment} machines</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
              {creationSuccess ? (
                <div className="py-8 text-center flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Espace Client Provisionné !</h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">Le tenant <strong>{companySlug}</strong> a été créé activement. L'environnement starter de maintenance a été initialisé.</p>
                </div>
              ) : creationLoading ? (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                  <Hourglass className="w-12 h-12 text-primary animate-spin" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Initialisation de l'espace...</h4>
                  <p className="text-[10px] text-slate-400">Création des bases, rôles et modèle de chaudière.</p>
                </div>
              ) : (
                <>
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Synthèse de Configuration</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Entreprise</span>
                      <h5 className="font-extrabold text-slate-800 dark:text-white text-sm mt-1">{companyName}</h5>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{companySlug}.platform.com</span>
                      <span className="text-[10px] block text-slate-500 mt-1 font-semibold">{city}, {country}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Administrateur</span>
                      <h5 className="font-extrabold text-slate-800 dark:text-white text-sm mt-1">{adminFirstName} {adminLastName}</h5>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{adminEmail}</span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Password: ••••••••</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: primaryColor }} />
                      <span>Accent {primaryColor}</span>
                      <span className="text-slate-300">|</span>
                      <span>Langue: {language}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Forfait Choisi</span>
                      <span className="text-primary font-extrabold uppercase text-xs">{subPlan} Plan</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
          <button type="button" onClick={() => onClose()} disabled={creationLoading} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer disabled:opacity-50">
            Fermer
          </button>
          <div className="flex gap-2">
            {currentStep > 1 && !creationSuccess && (
              <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} disabled={creationLoading} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour</span>
              </button>
            )}
            {currentStep < 6 ? (
              <button type="button" onClick={() => setCurrentStep(prev => prev + 1)} disabled={(currentStep === 1 && (!companyName || !taxNumber)) || (currentStep === 3 && !companySlug) || (currentStep === 4 && (!adminFirstName || !adminLastName || !adminEmail || !adminPassword))} className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
                <span>Suivant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              !creationSuccess && (
                <button type="button" onClick={handleWizardSubmit} disabled={creationLoading} className="px-5 py-2 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow">
                  {creationLoading ? 'Création...' : "Créer l'Entreprise"}
                  <Check className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
