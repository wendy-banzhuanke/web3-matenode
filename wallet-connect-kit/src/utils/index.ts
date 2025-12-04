export function formatWeiToEth(wei: string | number | bigint, decimalPlaces: number = 4): string {
  const bigIntWei = BigInt(wei);
  const divisor = BigInt(10 ** 18);
  
  const ethFull = bigIntWei / divisor;
  const remainder = bigIntWei % divisor;
  
  let decimals = '';
  if (decimalPlaces > 0 && remainder > 0n) {
    decimals = remainder.toString()
      .padStart(18, '0')
      .substring(0, decimalPlaces)
      .replace(/0+$/, '');
      
    if (decimals) decimals = `.${decimals}`;
  }

  return `${ethFull}${decimals}`;
}
