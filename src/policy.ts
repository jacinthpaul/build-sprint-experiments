export const policyTypes = ['Life insurance','Health insurance','Personal accident insurance','Motor insurance','Home insurance','Travel insurance','Other insurance'] as const;
export type Guide = { situation:string; firstAction:string; contactName:string; contactPhone:string; contactSource:string; source:string; instructionsUrl:string; deadlines:string; steps:string; documents:{name:string;available:boolean}[]; checkedOn:string };
export type Policy = { insurer:string; policyNumber:string; policyType:string; policyOwner:string; insured:string; nominee:string; startDate:string; endDate:string; paperLocation:string; coverage:string; exclusions:string; coverageSource:string; sumAssured:string; personalNote:string; guides:Guide[]; claimContact?:string; claimContactName?:string; claimContactPhone?:string };
export const situations:Record<string,string[]> = {
 'Life insurance':['Death','Maturity'], 'Health insurance':['Hospital treatment','Reimbursement'],
 'Personal accident insurance':['Accidental injury','Accidental death'], 'Motor insurance':['Accident damage','Theft'],
 'Home insurance':['Property damage','Theft'], 'Travel insurance':['Medical emergency abroad','Trip cancellation','Lost baggage'], 'Other insurance':['Other claim'],
};
export const blankGuide = (situation:string):Guide => ({situation,firstAction:'',contactName:'',contactPhone:'',contactSource:'',source:'',instructionsUrl:'',deadlines:'',steps:'',documents:[],checkedOn:''});
export const blankPolicy = ():Policy => ({insurer:'',policyNumber:'',policyType:'Life insurance',policyOwner:'',insured:'',nominee:'',startDate:'',endDate:'',paperLocation:'',coverage:'',exclusions:'',coverageSource:'',sumAssured:'',personalNote:'',claimContact:'',claimContactName:'',claimContactPhone:'',guides:[blankGuide('Death')]});
export const policyTitle = (p:Policy) => p.insurer || p.policyType;
export function savedContact(p:Policy) {
 if (p.claimContactName || p.claimContactPhone) return [p.claimContactName,p.claimContactPhone].filter(Boolean).join(' · ');
 return p.claimContact ?? p.guides.map(g=>[g.contactName,g.contactPhone,g.instructionsUrl].filter(Boolean).join(' · ')).filter(Boolean).join('\n');
}
export function missingDetails(p:Policy) {
 const missing = [['Insurance company',p.insurer],['Policy number',p.policyNumber],['Coverage end date',p.endDate],['Document location',p.paperLocation],['Coverage amount',p.sumAssured],['Agent or customer care details',savedContact(p)]].filter(([,value])=>!value.trim()).map(([label])=>label);
 return missing;
}
export function policyStatus(p:Policy) { return p.endDate && p.endDate < new Date().toISOString().slice(0,10) ? 'Coverage dates have ended — check renewal' : missingDetails(p).length ? `${missingDetails(p).length} details need attention` : 'Details entered — check against your policy'; }
export const validHttps = (value:string) => {try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch {return false;} };
