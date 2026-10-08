export function BankCoverNotice() {
 return <section className="bank-cover-notice" aria-labelledby="bank-cover-title">
  <h2 id="bank-cover-title">Insurance you may have through your bank</h2>
  <p>Some ATM or debit cards and bank-account packages include insurance. Check with your bank so your family knows whether there is another policy to look for.</p>
  <details><summary>What to check, including SBI and RuPay</summary>
   <ul>
    <li>Ask about your exact card or account package, the insurer and any policy or certificate reference.</li>
    <li>Confirm what is covered, whether cover is active, any card-use or enrolment conditions, and how to notify a claim.</li>
    <li>Get the current claim contact and written terms. Add the confirmed insurance details to Kosh.</li>
   </ul>
   <p>Accident cover may not cover natural death. Owning a card or account alone does not confirm eligibility.</p>
   <p className="bank-cover-sources">Official information: <a href="https://sbi.bank.in/web/personal-banking/cards/debit-card/insurance-covers-available" target="_blank" rel="noreferrer">SBI debit-card insurance</a> · <a href="https://sbi.bank.in/web/salary-account/central-government-salary-package" target="_blank" rel="noreferrer">An SBI salary-account example</a> · <a href="https://www.npci.org.in/what-we-do/rupay/circulars" target="_blank" rel="noreferrer">RuPay insurance circulars</a></p>
   <p className="muted">Links checked on 8 October 2026. Use the terms that apply to the event date. Keep card numbers, PINs and CVVs out of Kosh.</p>
  </details>
 </section>;
}
