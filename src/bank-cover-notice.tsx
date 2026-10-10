import { Lightbulb } from 'lucide-react';

export function BankCoverNotice() {
 return <section className="bank-cover-notice" aria-labelledby="bank-cover-title">
  <div className="bank-tip-heading">
   <Lightbulb size={24} aria-hidden="true"/>
   <h2 id="bank-cover-title">Did you know?</h2>
  </div>
  <div className="bank-tip-content">
   <div className="bank-tip-intro">
    <p className="bank-tip-lead">You may have more insurance than you realise.</p>
    <p>Cover can come with things you already use, like a bank card, salary account or benefits at work. It is easy to leave these out of your family's records.</p>
    <p className="bank-tip-fact">A <a href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2244475" target="_blank" rel="noreferrer">government update</a> reported nearly <strong>₹9,000 crore</strong> in unclaimed insurance money as of 28 February 2026.</p>
   </div>
   <div className="bank-tip-discovery">
    <p>For example, eligible <a href="https://sbi.bank.in/web/personal-banking/cards/debit-card/insurance-covers-available" target="_blank" rel="noreferrer">SBI debit cards</a> include insurance. Ask your bank what comes with your own card or account.</p>
    <details><summary>Where to look for hidden cover</summary>
     <ul>
      <li><strong>ATM, debit and credit cards</strong><span>Check the benefits of each card you hold.</span></li>
      <li><strong>Bank and salary accounts</strong><span>Ask about insurance included in your account package.</span></li>
      <li><strong>Benefits at work</strong><span>Ask HR about group life, health or accident cover.</span></li>
      <li><strong>Home, car and other loans</strong><span>Check your loan papers for insurance you took with the loan.</span></li>
      <li><strong>Schemes joined through your bank</strong><span>Look for insurance enrolments and premium deductions in your statements.</span></li>
     </ul>
     <p className="bank-tip-next">Found another policy? Confirm its details with the provider, then add it to Kosh for your family.</p>
    </details>
   </div>
  </div>
 </section>;
}
