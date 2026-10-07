import { blankPolicy, type Policy } from './policy';

// Public, fictional sample data. Never populated from saved user policies.
export const samplePolicy: Policy = {
  ...blankPolicy(),
  insurer: 'Example insurer (fictional)',
  policyNumber: 'DEMO-LIFE-001',
  endDate: '2027-12-31',
  sumAssured: '2500000',
  paperLocation: 'Sample: blue folder in the bedroom cupboard; PDF in the Insurance folder on the computer',
  claimContact: 'Sample only: add a verified agent number or the customer care details from your real policy.',
};
export const exampleFirstStep = `1. Find the policy papers in the blue folder or the Insurance folder on the computer.

2. Use the insurer's contact printed on the policy. Quote DEMO-LIFE-001 and ask how to notify a claim.

3. Ask which documents are needed, who may submit the claim, and what deadlines apply. These details have not been confirmed in this example.

Keep a note of whom you spoke to and any reference number. The sample coverage amount is ₹25,00,000; this is not a promised payout.`;
export const exampleEscalation = `Subject: Request for an update on claim [claim reference] — policy DEMO-LIFE-001

Dear [insurer's claims or grievance team],

I am writing about claim [claim reference] for policy DEMO-LIFE-001. The claim was submitted on [date].

My concern is [describe the delay or issue]. I last contacted your team on [date], and the response was [what they said, if anything].

Please confirm the current status, any outstanding documents, and when I can expect your response.

I have attached [list relevant documents or earlier correspondence].

Regards,
[your name]
[your contact details]

Sample draft only. Fill in the placeholders and check every statement before sending. No message has been sent.`;
export const exampleTelugu = `1. నీలం రంగు ఫోల్డర్‌లో లేదా కంప్యూటర్‌లోని Insurance ఫోల్డర్‌లో పాలసీ పత్రాలను చూడండి.

2. పాలసీ పత్రంలో ఉన్న బీమా సంస్థ సంప్రదింపు వివరాలను ఉపయోగించండి. DEMO-LIFE-001 పాలసీ నంబర్ చెప్పి, క్లెయిమ్ గురించి ఎలా తెలియజేయాలో అడగండి.

3. ఏ పత్రాలు అవసరమో, క్లెయిమ్‌ను ఎవరు సమర్పించవచ్చో, ఏ గడువులు వర్తిస్తాయో అడగండి. ఈ ఉదాహరణలో ఆ వివరాలు నిర్ధారించబడలేదు.

మీరు ఎవరితో మాట్లాడారో, వారు ఇచ్చిన రిఫరెన్స్ నంబర్‌ను రాసి ఉంచుకోండి. నమూనా బీమా మొత్తం ₹25,00,000; ఇది తప్పకుండా చెల్లిస్తామని ఇచ్చిన హామీ కాదు.`;
