import type {Content,TDocumentDefinitions} from 'pdfmake/interfaces';
import type {Policy} from './policy';
import {familyNote,familyIntro,familyCaution} from './family-note';
import {themeToken,pdfSize} from './theme';

export async function downloadFamilyPdf(p:Policy,{sample=false}:{sample?:boolean}={}){
 const [{default:pdfMake},{default:fonts}]=await Promise.all([import('pdfmake/build/pdfmake'),import('pdfmake/build/vfs_fonts')]);
 pdfMake.addVirtualFileSystem(fonts);
 const note=familyNote(p);
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
  {text:familyCaution,fontSize:pdfSize('meta'),color:themeToken('--text-secondary'),margin:[0,4,0,8]},
  {text:`Downloaded on ${new Date().toLocaleDateString('en-IN')}. This copy does not update automatically.`,fontSize:pdfSize('meta'),color:themeToken('--text-secondary')},
 ];
 const definition:TDocumentDefinitions={
  info:{title:`For my family — policy ${p.policyNumber}`},pageSize:'A4',pageMargins:[42,42,42,42],
  defaultStyle:{font:'Roboto',fontSize:pdfSize('body'),lineHeight:1.2,color:themeToken('--text')},content,
  footer:(page,count)=>({text:`For my family | ${page} / ${count}`,alignment:'center',fontSize:pdfSize('meta'),color:themeToken('--text-secondary'),margin:[0,16,0,0]}),
 };
 const name=p.policyNumber.replace(/[^a-z0-9_-]/gi,'-').slice(0,60)||'policy';
 await pdfMake.createPdf(definition).download(`for-my-family-${name}.pdf`);
}
