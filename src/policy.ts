export const policyTypes = ['Life insurance','Health insurance','Personal accident insurance','Motor insurance','Home insurance','Travel insurance','Other insurance'] as const;
export type Guide = { situation:string; firstAction:string; contactName:string; contactPhone:string; contactSource:string; source:string; instructionsUrl:string; deadlines:string; steps:string; documents:{name:string;available:boolean}[]; checkedOn:string };
export type Policy = { insurer:string; policyNumber:string; policyType:string; policyOwner:string; insured:string; nominee:string; startDate:string; endDate:string; paperLocation:string; coverage:string; exclusions:string; coverageSource:string; sumAssured:string; personalNote:string; guides:Guide[] };
export const situations:Record<string,string[]> = {
 'Life insurance':['Death','Maturity'], 'Health insurance':['Hospital treatment','Reimbursement'],
 'Personal accident insurance':['Accidental injury','Accidental death'], 'Motor insurance':['Accident damage','Theft'],
 'Home insurance':['Property damage','Theft'], 'Travel insurance':['Medical emergency abroad','Trip cancellation','Lost baggage'], 'Other insurance':['Other claim'],
};
export const blankGuide = (situation:string):Guide => ({situation,firstAction:'',contactName:'',contactPhone:'',contactSource:'',source:'',instructionsUrl:'',deadlines:'',steps:'',documents:[],checkedOn:''});
export const blankPolicy = ():Policy => ({insurer:'',policyNumber:'',policyType:'Life insurance',policyOwner:'',insured:'',nominee:'',startDate:'',endDate:'',paperLocation:'',coverage:'',exclusions:'',coverageSource:'',sumAssured:'',personalNote:'',guides:[blankGuide('Death')]});
export function missingDetails(p:Policy) {
 const missing = [['Insurer',p.insurer],['Policy number',p.policyNumber],['Policy owner',p.policyOwner],['Who or what is covered',p.insured],['Document location',p.paperLocation],['Coverage details',p.coverage],['Exclusions',p.exclusions],['Coverage source',p.coverageSource]].filter(([,value])=>!value.trim()).map(([label])=>label);
 if (!p.guides.some(g=>g.firstAction.trim() && g.source.trim())) missing.push('Sourced first claim action');
 if (!p.guides.some(g=>(g.contactPhone.trim() || g.instructionsUrl.trim()) && g.contactSource.trim())) missing.push('Sourced claim contact');
 return missing;
}
export function policyStatus(p:Policy) { return p.endDate && p.endDate < new Date().toISOString().slice(0,10) ? 'Coverage dates have ended — check renewal' : missingDetails(p).length ? `${missingDetails(p).length} details need attention` : 'Details entered — check against your policy'; }
export const validHttps = (value:string) => {try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch {return false;} };