import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export function contactPhone(value: string) {
  if (value.length > 64 || !/^[+\d\s().-]+$/.test(value.trim())) return null;
  const phone = parsePhoneNumberFromString(value.trim(), { defaultCountry: 'IN', extract: false });
  return phone?.isValid() ? phone : null;
}

export type EssentialPolicy = { insurer: string; policyNumber: string; claimContactName?: string; claimContactPhone?: string };
export function essentialErrors(policy: EssentialPolicy): Partial<Record<keyof EssentialPolicy, string>> {
  const errors: Partial<Record<keyof EssentialPolicy, string>> = {};
  if (!policy.insurer.trim()) errors.insurer = 'Add the insurance company so your family can identify this policy.';
  else if (policy.insurer.trim().length > 100) errors.insurer = 'Keep the insurance company name under 100 characters.';
  if (!policy.policyNumber.trim()) errors.policyNumber = 'Add the policy number before sharing.';
  if (!policy.claimContactName?.trim()) errors.claimContactName = 'Add the agent’s name or customer care team name.';
  else if (policy.claimContactName.trim().length > 200) errors.claimContactName = 'Keep the contact name under 200 characters.';
  if (!policy.claimContactPhone?.trim()) errors.claimContactPhone = 'Add a phone number your family can use.';
  else if (!contactPhone(policy.claimContactPhone)) errors.claimContactPhone = 'Enter a valid phone number. Include the area code for a landline or + and the country code outside India.';
  return errors;
}
