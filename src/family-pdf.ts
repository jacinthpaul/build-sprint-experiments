import type {Content,TDocumentDefinitions} from 'pdfmake/interfaces';
import type {Policy} from './policy';
import {familyNote,familyIntro,familyCaution} from './family-note';

export async function downloadFamilyPdf(p:Policy,{sample=false}:{sample?:boolean}={}){
 const [{default:pdfMake},{default:fonts}]=await Promise.all([import('pdfmake/build/pdfmake'),import('pdfmake/build/vfs_fonts')]);
 pdfMake.addVirtualFileSystem(fonts);
 const note=familyNote(p);
 const content:Content[]=[
  ...(sample?[{text:'SAMPLE ONLY — fictional policy details. Not a real insurance policy.',bold:true,color:'#234b70',margin:[0,0,0,16]} as Content]:[]),
  {text:'For my family',fontSize:26,color:'#234b70',margin:[0,0,0,12]},
  {text:familyIntro,margin:[0,0,0,18]},
  {table:{widths:[160,'*'],body:note.facts.map(([label,value])=>[{text:label,color:'#526578'},{text:value,bold:true}])},layout:'lightHorizontalLines',margin:[0,0,0,22]},
  {text:'How to start a claim',fontSize:16,bold:true,margin:[0,0,0,14]},
  ...note.steps.map((step,index):Content=>({stack:[
   {text:`${index+1}. ${step.title}`,fontSize:12,bold:true,margin:[0,0,0,5]},
   ...step.paragraphs.map(text=>({text,margin:[0,0,0,4] as [number,number,number,number]})),
  ],margin:[0,0,0,12]})),
  {text:familyCaution,fontSize:9,color:'#526578',margin:[0,4,0,8]},
  {text:`Downloaded on ${new Date().toLocaleDateString('en-IN')}. This copy does not update automatically.`,fontSize:9,color:'#526578'},
 ];
 const definition:TDocumentDefinitions={
  info:{title:`For my family — policy ${p.policyNumber}`},pageSize:'A4',pageMargins:[42,42,42,42],
  defaultStyle:{font:'Roboto',fontSize:10.5,lineHeight:1.2,color:'#1c3449'},content,
  footer:(page,count)=>({text:`For my family | ${page} / ${count}`,alignment:'center',fontSize:9,color:'#526578',margin:[0,16,0,0]}),
 };
 const name=p.policyNumber.replace(/[^a-z0-9_-]/gi,'-').slice(0,60)||'policy';
 await pdfMake.createPdf(definition).download(`for-my-family-${name}.pdf`);
}
