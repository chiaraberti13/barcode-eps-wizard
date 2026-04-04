const EAN_12_REGEX = /^\d{12}$/;
const EAN_13_REGEX = /^\d{13}$/;

export function normalizeEAN13Input(code) {
  const normalizedCode = String(code ?? '').trim();

  if (EAN_12_REGEX.test(normalizedCode)) {
    return `${normalizedCode}${calculateEAN13CheckDigit(normalizedCode)}`;
  }

  if (EAN_13_REGEX.test(normalizedCode)) {
    const expectedCheckDigit = calculateEAN13CheckDigit(normalizedCode.slice(0, 12));
    const receivedCheckDigit = Number.parseInt(normalizedCode[12], 10);

    if (expectedCheckDigit !== receivedCheckDigit) {
      throw new Error('Check digit EAN-13 non valido.');
    }

    return normalizedCode;
  }

  throw new Error('Codice EAN-13 non valido: sono ammesse solo 12 o 13 cifre numeriche.');
}

export function calculateEAN13CheckDigit(code12) {
  if (!EAN_12_REGEX.test(String(code12 ?? ''))) {
    throw new Error('Per il check digit sono richieste esattamente 12 cifre numeriche.');
  }

  let sumOdd = 0;
  let sumEven = 0;

  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) {
      sumOdd += parseInt(code12[i], 10);
    } else {
      sumEven += parseInt(code12[i], 10);
    }
  }

  const total = sumOdd + (sumEven * 3);
  const remainder = total % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

export function encodeEAN13(code) {
  const L_codes = {
    '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
    '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
    '8': '0110111', '9': '0001011'
  };

  const G_codes = {
    '0': '0100111', '1': '0110011', '2': '0011011', '3': '0100001',
    '4': '0011101', '5': '0111001', '6': '0000101', '7': '0010001',
    '8': '0001001', '9': '0010111'
  };

  const R_codes = {
    '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010',
    '4': '1011100', '5': '1001110', '6': '1010000', '7': '1000100',
    '8': '1001000', '9': '1110100'
  };

  const firstDigitPatterns = [
    'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
    'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
  ];

  const normalizedCode = normalizeEAN13Input(code);

  const firstDigit = normalizedCode[0];
  const pattern = firstDigitPatterns[parseInt(firstDigit, 10)];

  let bars = '101';

  for (let i = 0; i < 6; i++) {
    const digit = normalizedCode[i + 1];
    bars += pattern[i] === 'L' ? L_codes[digit] : G_codes[digit];
  }

  bars += '01010';

  for (let i = 0; i < 6; i++) {
    const digit = normalizedCode[i + 7];
    bars += R_codes[digit];
  }

  bars += '101';

  return bars;
}

export function generateEPS(codiceBarcode, _codiceArticolo = '') {
  const normalizedCode = normalizeEAN13Input(codiceBarcode);
  const bars = encodeEAN13(normalizedCode);
  const barWidth = 1.0;
  const barHeight = 50.0;
  const textHeight = 5.0;
  const quietZone = 10.0;

  const totalWidth = bars.length * barWidth + (2 * quietZone);
  const totalHeight = barHeight + textHeight + 6.0;

  let eps = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: Century Italia Barcode Generator
%%Title: ${normalizedCode}
%%Pages: 0
%%BoundingBox: 0 0 ${Math.round(totalWidth)} ${Math.round(totalHeight)}
%%EndComments
/TL { setlinewidth moveto lineto stroke } bind def
/TC { moveto 0 360 arc 360 0 arcn fill } bind def
/TH { 0 setlinewidth moveto lineto lineto lineto lineto lineto closepath fill } bind def
/TB { 2 copy } bind def
/TR { newpath 4 1 roll exch moveto 1 index 0 rlineto 0 exch rlineto neg 0 rlineto closepath fill } bind def
/TE { pop pop } bind def
newpath
0.00 0.00 0.00 setrgbcolor
1.00 1.00 1.00 setrgbcolor
${totalHeight.toFixed(2)} 0.00 TB 0.00 ${totalWidth.toFixed(2)} TR
TE
0.00 0.00 0.00 setrgbcolor
`;

  let xPos = quietZone;
  eps += `${barHeight.toFixed(2)} ${(textHeight + 5.0).toFixed(2)} TB `;

  for (let i = 0; i < bars.length; i++) {
    if (bars[i] === '1') {
      eps += `${xPos.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
      if (i < bars.length - 1) {
        eps += 'TB ';
      }
    }
    xPos += barWidth;
  }

  eps += 'TE\n';

  eps += `0.00 0.00 0.00 setrgbcolor\n`;
  eps += `${textHeight.toFixed(2)} ${textHeight.toFixed(2)} TB `;

  eps += `${quietZone.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
  eps += `TB ${(quietZone + barWidth * 2).toFixed(2)} ${barWidth.toFixed(2)} TR\n`;

  const centerX = quietZone + (bars.length / 2 * barWidth) - barWidth;
  eps += `TB ${centerX.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
  eps += `TB ${(centerX + barWidth * 2).toFixed(2)} ${barWidth.toFixed(2)} TR\n`;

  const endX = quietZone + (bars.length - 3) * barWidth;
  eps += `TB ${endX.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
  eps += `TB ${(endX + barWidth * 2).toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
  eps += 'TE\n';

  eps += `0.00 0.00 0.00 setrgbcolor
matrix currentmatrix
/Helvetica findfont
11.00 scalefont setfont
`;

  const firstDigitX = quietZone - 6.0;
  eps += ` 0 0 moveto ${firstDigitX.toFixed(2)} 1.50 translate 0.00 rotate 0 0 moveto
 (${normalizedCode[0]}) stringwidth
pop
-2 div 0 rmoveto
 (${normalizedCode[0]}) show
setmatrix
`;

  const leftText = normalizedCode.substring(1, 7);
  const leftTextX = quietZone + (bars.length / 4 * barWidth);
  eps += `matrix currentmatrix
/Helvetica findfont
11.00 scalefont setfont
 0 0 moveto ${leftTextX.toFixed(2)} 1.50 translate 0.00 rotate 0 0 moveto
 (${leftText}) stringwidth
pop
-2 div 0 rmoveto
 (${leftText}) show
setmatrix
`;

  const rightText = normalizedCode.substring(7, 13);
  const rightTextX = quietZone + (3 * bars.length / 4 * barWidth);
  eps += `matrix currentmatrix
/Helvetica findfont
11.00 scalefont setfont
 0 0 moveto ${rightTextX.toFixed(2)} 1.50 translate 0.00 rotate 0 0 moveto
 (${rightText}) stringwidth
pop
-2 div 0 rmoveto
 (${rightText}) show
setmatrix

showpage
`;

  return eps;
}
