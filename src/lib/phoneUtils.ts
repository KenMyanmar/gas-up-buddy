/** Convert international +959xxx to local 09xxx (database format) */
export const toLocal = (phone: string): string => {
  if (phone.startsWith('+959')) return '09' + phone.slice(4);
  if (phone.startsWith('+95')) return '0' + phone.slice(3);
  return phone;
};

/** Convert local 09xxx to international +959xxx (Supabase Auth format) */
export const toInternational = (phone: string): string => {
  if (phone.startsWith('09')) return '+95' + phone.slice(1);
  if (phone.startsWith('+95')) return phone;
  return phone;
};
