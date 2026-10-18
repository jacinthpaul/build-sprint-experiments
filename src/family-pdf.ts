import type {Content,TDocumentDefinitions} from 'pdfmake/interfaces';
import type {Policy} from './policy';
import {familyNote,familyIntro,familyCaution} from './family-note';
import {themeToken,pdfSize} from './theme';

export async function downloadFamilyPdf(p:Policy,{sample=false}:{sample?:boolean}={}){
 const [{default:pdfMake},{default:fonts}]=await Promise.all([import('pdfmake/build/pdfmake'),import('pdfmake/build/vfs_fonts')]);
 pdfMake.addVirtualFileSystem(fonts);
 const note=familyNote(p);
 const earlier:Content[]=[];
 for(const [label,value] of [['Policy owner',p.policyOwner],['Who or what is covered',p.insured],['Coverage',p.coverage],['Exclusions',p.exclusions]]) {
  if(value) earlier.push({text:`${label}: ${value}`,margin:[0,0,0,8]});
 }
 if(p.coverage||p.exclusions) earlier.push({text:p.coverageSource?`Source: ${p.coverageSource}`:'Source missing — needs checking.',fontSize:pdfSize('meta'),margin:[0,0,0,8]});
 if(p.personalNote) earlier.push({text:p.personalNote,margin:[0,0,0,12]});
 for(const guide of p.guides.filter(g=>g.firstAction||g.steps||g.documents.length||g.deadlines)) {
  earlier.push({text:guide.situation,headlineLevel:1,fontSize:pdfSize('step'),bold:true,margin:[0,8,0,5]});
  for(const text of [guide.firstAction,guide.steps,guide.deadlines?`Stated deadlines: ${guide.deadlines}`:'']) {
   if(text) earlier.push({text,margin:[0,0,0,8]});
  }
  if(guide.documents.length) earlier.push({ul:guide.documents.map(d=>`${d.name} — ${d.available?'Available':'Still needed'}`),margin:[0,0,0,8]});
  earlier.push({text:guide.source?`Source: ${guide.source}`:'Source missing — needs checking.',fontSize:pdfSize('meta'),margin:[0,0,0,8]});
  if(guide.checkedOn) earlier.push({text:`Last checked by the owner: ${guide.checkedOn}`,fontSize:pdfSize('meta'),margin:[0,0,0,8]});
 }
 const content:Content[]=[
  ...(sample?[{text:'SAMPLE ONLY — fictional policy details. Not a real insurance policy.',bold:true,color:themeToken('--text'),margin:[0,0,0,16]} as Content]:[]),
  {text:'For my family',fontSize:pdfSize('title'),color:themeToken('--text'),margin:[0,0,0,12]},
  {text:familyIntro,margin:[0,0,0,18]},
  {table:{widths:[160,'*'],body:note.facts.map(([label,value])=>[{text:label,color:themeToken('--text-secondary')},{text:value,bold:true}])},layout:'lightHorizontalLines',margin:[0,0,0,22]},
  {text:'How to start a claim',fontSize:pdfSize('section'),bold:true,margin:[0,0,0,14]},
  ...note.steps.map((step,index):Content=>({stack:[
   {text:`${index+1}. ${step.title}`,fontSize:pdfSize('step'),bold:true,margin:[0,0,0,5]},
   ...step.paragraphs.map(text=>({text,margin:[0,0,0,4] as [number,number,number,number]})),
  ],margin:[0,0,0,12]})),
  ...(earlier.length?[{text:'Earlier saved details',headlineLevel:1,fontSize:pdfSize('section'),bold:true,margin:[0,8,0,14]} as Content,...earlier]:[]),
  {text:familyCaution,fontSize:pdfSize('meta'),color:themeToken('--text-secondary'),margin:[0,4,0,8]},
  {text:`Downloaded on ${new Date().toLocaleDateString('en-IN')}. This copy does not update automatically.`,fontSize:pdfSize('meta'),color:themeToken('--text-secondary')},
 ];
 const definition:TDocumentDefinitions={
  info:{title:`For my family — policy ${p.policyNumber}`},pageSize:'A4',pageMargins:[42,42,42,42],
  defaultStyle:{font:'Roboto',fontSize:pdfSize('body'),lineHeight:1.2,color:themeToken('--text')},content,
  pageBreakBefore:(node,following)=>Boolean(node.headlineLevel)&&!following.getFollowingNodesOnPage().some(next=>next.id!=='family-pdf-footer'),
  footer:(page,count)=>({id:'family-pdf-footer',text:`For my family | ${page} / ${count}`,alignment:'center',fontSize:pdfSize('meta'),color:themeToken('--text-secondary'),margin:[0,16,0,0]}),
 };
 const name=p.policyNumber.replace(/[^a-z0-9_-]/gi,'-').slice(0,60)||'policy';
 await pdfMake.createPdf(definition).download(`for-my-family-${name}.pdf`);
}
