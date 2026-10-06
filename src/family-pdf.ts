import type {Content, TDocumentDefinitions} from 'pdfmake/interfaces';
import {savedContact, type Policy} from './policy';

export function policyShareText(p:Policy, link?:string) {
 return [
  'Kosh - insurance information for my family',
  `Insurance type: ${p.policyType}`,
  `Policy number: ${p.policyNumber}`,
  `Coverage end date: ${p.endDate || 'Not recorded'}`,
  `Where the hard or soft copy is kept: ${p.paperLocation || 'Not recorded'}`,
  `Coverage amount: ${p.sumAssured ? 'INR ' + Number(p.sumAssured).toLocaleString('en-IN') : 'Not recorded'}`,
  `Agent or customer care details: ${savedContact(p) || 'Not recorded'}`,
  ...(link ? ['', `Private policy link: ${link}`, 'Sign in with the Kosh account the policyholder gave access to.'] : []),
  '', 'These are saved policy details. Confirm current claim requirements and contact details with the insurer.',
  'Coverage and claim approval depend on the policy and insurer. Sharing does not change the nominee.',
 ].join('\n');
}
export const policyEmailHref = (p:Policy, link?:string) => 'mailto:?subject=' + encodeURIComponent(`Insurance policy for my family - ${p.policyNumber}`) + '&body=' + encodeURIComponent(policyShareText(p,link));

export async function downloadFamilyPdf(p:Policy) {
 const [{default:pdfMake}, {default:fonts}] = await Promise.all([import('pdfmake/build/pdfmake'),import('pdfmake/build/vfs_fonts')]);
 pdfMake.addVirtualFileSystem(fonts);
 const rows = [
  ['Insurance type',p.policyType],['Policy number',p.policyNumber],
  ['Coverage end date',p.endDate || 'Not recorded'],
  ['Where the hard or soft copy is kept',p.paperLocation || 'Not recorded'],
  ['Coverage amount',p.sumAssured ? 'INR ' + Number(p.sumAssured).toLocaleString('en-IN') : 'Not recorded'],
  ['Agent or customer care details',savedContact(p) || 'Not recorded'],
 ].map(([label,value])=>[{text:label,color:'#526578'}, {text:value,bold:true}]);
 const content:Content[] = [
  {text:'Kosh',fontSize:24,bold:true,margin:[0,0,0,12]},
  {text:'Insurance information for my family',fontSize:18,bold:true,margin:[0,0,0,24]},
  {table:{widths:[160,'*'],body:rows},layout:'lightHorizontalLines',margin:[0,0,0,24]},
  {text:'This copy contains saved policy details. Confirm current claim requirements and contact details with the insurer.',margin:[0,0,0,12]},
  {text:'Coverage and claim approval depend on the policy and insurer. Sharing does not change the nominee.',color:'#526578',margin:[0,0,0,12]},
  {text:`Downloaded on ${new Date().toLocaleDateString('en-IN')}. This copy does not update automatically.`,color:'#526578'},
 ];
 const definition:TDocumentDefinitions = {
  info:{title:`Kosh - policy ${p.policyNumber}`},pageSize:'A4',pageMargins:[42,42,42,42],
  defaultStyle:{font:'Roboto',fontSize:11,lineHeight:1.3,color:'#1c3449'},content,
  footer:(page,count)=>({text:`Kosh | ${page} / ${count}`,alignment:'center',fontSize:9,color:'#526578',margin:[0,16,0,0]}),
 };
 const name=p.policyNumber.replace(/[^a-z0-9_-]/gi,'-').slice(0,60)||'policy';
 await pdfMake.createPdf(definition).download(`kosh-${name}.pdf`);
}
