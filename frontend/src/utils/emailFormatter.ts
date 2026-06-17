export const formatEmail = (value: string) => {
  let finalValue = value.toLowerCase().replace(/\s/g, '');
  
  const validTLDs = [
    '.com.co', '.org.co', '.net.co', '.edu.co', '.gov.co',
    '.com', '.org', '.net', '.edu', '.gov', '.mil', '.info', '.biz',
    '.co', '.es', '.mx', '.ar', '.cl', '.pe'
  ];

  if (validTLDs.some(tld => finalValue.endsWith(tld))) {
    return finalValue;
  }

  for (const tld of validTLDs) {
    const escapedTld = tld.replace(/\./g, '\\.');
    const regex = new RegExp(`(${escapedTld})([^.]+)$`, 'i');
    if (regex.test(finalValue)) {
      finalValue = finalValue.replace(regex, '$1');
      break;
    }
  }

  return finalValue;
};
