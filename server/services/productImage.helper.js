/**
 * Generates an accurate, product-matched studio illustration data URI for each product
 * and constructs an 80-product catalog where every mart (Martello Downtown, Martello West,
 * Prodexa Central, Storenta Plaza) stocks 50+ products, while preserving varied mart availability
 * (some products at 1 mart, some at 2 marts, some at 3 marts, some at 4 marts).
 */

function createProductImage(title, brand, category, iconType, bgStart, bgEnd, accent) {
  const icons = {
    smartphone: `
      <rect x="165" y="45" width="90" height="165" rx="16" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="172" y="54" width="76" height="147" rx="10" fill="url(#screenGrad)"/>
      <rect x="197" y="59" width="26" height="6" rx="3" fill="#0f172a"/>
      <circle cx="186" cy="74" r="6" fill="#1e293b" stroke="${accent}" stroke-width="1.5"/>
      <circle cx="186" cy="90" r="6" fill="#1e293b" stroke="${accent}" stroke-width="1.5"/>
    `,
    laptop: `
      <rect x="125" y="58" width="170" height="108" rx="8" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="133" y="66" width="154" height="92" rx="4" fill="url(#screenGrad)"/>
      <path d="M105 166 L315 166 L300 180 L120 180 Z" fill="#334155" stroke="${accent}" stroke-width="2"/>
      <rect x="190" y="167" width="40" height="4" rx="2" fill="#94a3b8"/>
    `,
    tv: `
      <rect x="110" y="52" width="200" height="118" rx="6" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="117" y="59" width="186" height="104" rx="3" fill="url(#screenGrad)"/>
      <path d="M185 170 L170 190 L250 190 L235 170 Z" fill="#334155"/>
      <line x1="155" y1="190" x2="265" y2="190" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
    `,
    earbuds: `
      <rect x="155" y="85" width="110" height="95" rx="28" fill="#f8fafc" stroke="${accent}" stroke-width="3"/>
      <line x1="155" y1="125" x2="265" y2="125" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="195" y="118" width="30" height="14" rx="7" fill="#e2e8f0" stroke="${accent}" stroke-width="1.5"/>
      <circle cx="185" cy="70" r="16" fill="#ffffff" stroke="${accent}" stroke-width="3"/>
      <rect x="179" y="80" width="10" height="22" rx="5" fill="#ffffff" stroke="${accent}" stroke-width="2"/>
      <circle cx="235" cy="70" r="16" fill="#ffffff" stroke="${accent}" stroke-width="3"/>
      <rect x="231" y="80" width="10" height="22" rx="5" fill="#ffffff" stroke="${accent}" stroke-width="2"/>
    `,
    headphones: `
      <path d="M145 135 A65 65 0 0 1 275 135" fill="none" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
      <path d="M145 135 A65 65 0 0 1 275 135" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <rect x="130" y="120" width="28" height="58" rx="14" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="262" y="120" width="28" height="58" rx="14" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
    `,
    console: `
      <rect x="155" y="48" width="62" height="142" rx="8" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <line x1="170" y1="62" x2="170" y2="175" stroke="${accent}" stroke-width="2"/>
      <path d="M225 135 C225 118, 285 118, 285 135 L292 168 C292 178, 275 182, 268 168 L262 156 L248 156 L242 168 C235 182, 218 178, 218 168 Z" fill="#1e293b" stroke="${accent}" stroke-width="2.5"/>
      <circle cx="242" cy="140" r="4" fill="${accent}"/>
      <circle cx="268" cy="140" r="4" fill="#f8fafc"/>
    `,
    tablet: `
      <rect x="145" y="48" width="130" height="155" rx="12" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="153" y="56" width="114" height="139" rx="6" fill="url(#screenGrad)"/>
      <line x1="255" y1="42" x2="295" y2="165" stroke="#f8fafc" stroke-width="6" stroke-linecap="round"/>
      <line x1="255" y1="42" x2="295" y2="165" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
    `,
    camera: `
      <rect x="135" y="80" width="150" height="98" rx="14" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <path d="M175 80 L185 62 L235 62 L245 80 Z" fill="#1e293b" stroke="${accent}" stroke-width="2"/>
      <circle cx="210" cy="130" r="34" fill="#1e293b" stroke="${accent}" stroke-width="4"/>
      <circle cx="210" cy="130" r="20" fill="url(#screenGrad)"/>
      <circle cx="262" cy="98" r="6" fill="#ef4444"/>
    `,
    mouse: `
      <rect x="172" y="55" width="76" height="135" rx="38" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <line x1="210" y1="55" x2="210" y2="110" stroke="#475569" stroke-width="2"/>
      <rect x="205" y="72" width="10" height="24" rx="5" fill="${accent}"/>
      <path d="M172 108 Q210 118 248 108" fill="none" stroke="${accent}" stroke-width="2"/>
    `,
    keyboard: `
      <rect x="110" y="85" width="200" height="78" rx="10" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <g fill="#334155" stroke="${accent}" stroke-width="1">
        <rect x="122" y="97" width="18" height="14" rx="3"/><rect x="145" y="97" width="18" height="14" rx="3"/><rect x="168" y="97" width="18" height="14" rx="3"/><rect x="191" y="97" width="18" height="14" rx="3"/><rect x="214" y="97" width="18" height="14" rx="3"/><rect x="237" y="97" width="18" height="14" rx="3"/><rect x="260" y="97" width="38" height="14" rx="3"/>
        <rect x="122" y="117" width="26" height="14" rx="3"/><rect x="153" y="117" width="18" height="14" rx="3"/><rect x="176" y="117" width="18" height="14" rx="3"/><rect x="199" y="117" width="18" height="14" rx="3"/><rect x="222" y="117" width="18" height="14" rx="3"/><rect x="245" y="117" width="53" height="14" rx="3"/>
        <rect x="122" y="137" width="35" height="14" rx="3"/><rect x="162" y="137" width="96" height="14" rx="3" fill="${accent}"/><rect x="263" y="137" width="35" height="14" rx="3"/>
      </g>
    `,
    speaker: `
      <rect x="135" y="78" width="150" height="86" rx="43" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <circle cx="178" cy="121" r="24" fill="#1e293b" stroke="${accent}" stroke-width="2.5"/>
      <circle cx="178" cy="121" r="8" fill="${accent}"/>
      <circle cx="242" cy="121" r="24" fill="#1e293b" stroke="${accent}" stroke-width="2.5"/>
      <circle cx="242" cy="121" r="8" fill="${accent}"/>
    `,
    drone: `
      <rect x="180" y="102" width="60" height="36" rx="12" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <circle cx="210" cy="120" r="8" fill="${accent}"/>
      <line x1="180" y1="108" x2="130" y2="75" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
      <line x1="240" y1="108" x2="290" y2="75" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
      <line x1="180" y1="132" x2="130" y2="165" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
      <line x1="240" y1="132" x2="290" y2="165" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="130" cy="75" rx="28" ry="6" fill="${accent}" opacity="0.85"/>
      <ellipse cx="290" cy="75" rx="28" ry="6" fill="${accent}" opacity="0.85"/>
      <ellipse cx="130" cy="165" rx="28" ry="6" fill="${accent}" opacity="0.85"/>
      <ellipse cx="290" cy="165" rx="28" ry="6" fill="${accent}" opacity="0.85"/>
    `,
    shoes: `
      <path d="M115 152 L135 90 L175 90 L195 120 L285 130 C302 132, 308 148, 305 162 L115 162 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
      <rect x="112" y="160" width="195" height="16" rx="8" fill="#f8fafc" stroke="${accent}" stroke-width="2"/>
      <path d="M155 128 L195 142 L245 122" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    sunglasses: `
      <rect x="120" y="95" width="78" height="52" rx="22" fill="#0f172a" stroke="${accent}" stroke-width="4"/>
      <rect x="222" y="95" width="78" height="52" rx="22" fill="#0f172a" stroke="${accent}" stroke-width="4"/>
      <path d="M198 112 Q210 100 222 112" fill="none" stroke="${accent}" stroke-width="4"/>
      <line x1="120" y1="108" x2="100" y2="96" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <line x1="300" y1="108" x2="320" y2="96" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
    `,
    jacket: `
      <path d="M165 58 L190 58 L210 78 L230 58 L255 58 L295 88 L278 172 L248 172 L248 110 L242 182 L178 182 L172 110 L172 172 L142 172 L125 88 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3" stroke-linejoin="round"/>
      <line x1="210" y1="78" x2="210" y2="182" stroke="#f8fafc" stroke-width="2.5"/>
    `,
    shirt: `
      <path d="M162 60 L190 60 L210 76 L230 60 L258 60 L292 88 L272 122 L250 108 L250 182 L170 182 L170 108 L148 122 L128 88 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="210" cy="96" r="3" fill="#ffffff"/>
      <circle cx="210" cy="118" r="3" fill="#ffffff"/>
      <circle cx="210" cy="140" r="3" fill="#ffffff"/>
    `,
    jeans: `
      <path d="M165 55 L255 55 L268 185 L225 185 L210 108 L195 185 L152 185 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3" stroke-linejoin="round"/>
      <line x1="165" y1="72" x2="255" y2="72" stroke="#f8fafc" stroke-width="2"/>
      <line x1="210" y1="55" x2="210" y2="95" stroke="#f8fafc" stroke-width="2"/>
    `,
    watch: `
      <rect x="192" y="42" width="36" height="156" rx="8" fill="#334155" stroke="${accent}" stroke-width="2"/>
      <circle cx="210" cy="120" r="42" fill="#0f172a" stroke="${accent}" stroke-width="4"/>
      <circle cx="210" cy="120" r="33" fill="url(#screenGrad)"/>
      <line x1="210" y1="120" x2="210" y2="96" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <line x1="210" y1="120" x2="230" y2="128" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="210" cy="120" r="4" fill="#ffffff"/>
    `,
    bag: `
      <path d="M180 82 C180 50, 240 50, 240 82" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
      <path d="M145 82 L275 82 L288 180 L132 180 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="210" cy="112" r="8" fill="${accent}"/>
    `,
    appliance: `
      <rect x="152" y="55" width="116" height="132" rx="18" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="168" y="75" width="84" height="42" rx="8" fill="url(#screenGrad)"/>
      <circle cx="210" cy="150" r="18" fill="#1e293b" stroke="${accent}" stroke-width="3"/>
      <circle cx="210" cy="150" r="6" fill="${accent}"/>
    `,
    vacuum: `
      <line x1="155" y1="55" x2="235" y2="168" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
      <rect x="135" y="48" width="42" height="28" rx="8" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="202" y="162" width="72" height="22" rx="8" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
    `,
    chair: `
      <rect x="172" y="48" width="76" height="78" rx="14" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
      <rect x="158" y="126" width="104" height="16" rx="8" fill="#0f172a" stroke="${accent}" stroke-width="2.5"/>
      <line x1="210" y1="142" x2="210" y2="178" stroke="#334155" stroke-width="6"/>
      <line x1="170" y1="182" x2="250" y2="182" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="172" cy="188" r="5" fill="#0f172a"/>
      <circle cx="248" cy="188" r="5" fill="#0f172a"/>
    `,
    bulb: `
      <path d="M175 102 A35 35 0 1 1 245 102 C240 120, 230 130, 228 145 L192 145 C190 130, 180 120, 175 102 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
      <rect x="194" y="146" width="32" height="24" rx="6" fill="#475569" stroke="${accent}" stroke-width="2"/>
      <line x1="194" y1="154" x2="226" y2="154" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="194" y1="162" x2="226" y2="162" stroke="#cbd5e1" stroke-width="2"/>
    `,
    book: `
      <rect x="152" y="48" width="116" height="145" rx="8" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
      <rect x="152" y="48" width="18" height="145" rx="4" fill="#0f172a" opacity="0.5"/>
      <rect x="182" y="72" width="68" height="10" rx="4" fill="#ffffff" opacity="0.9"/>
      <rect x="182" y="90" width="52" height="8" rx="4" fill="#ffffff" opacity="0.7"/>
      <circle cx="216" cy="142" r="22" fill="#0f172a" opacity="0.35" stroke="#ffffff" stroke-width="2"/>
    `,
    dumbbell: `
      <rect x="155" y="112" width="110" height="14" rx="6" fill="#64748b" stroke="${accent}" stroke-width="2"/>
      <rect x="122" y="80" width="22" height="78" rx="6" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <rect x="142" y="90" width="16" height="58" rx="5" fill="#1e293b" stroke="${accent}" stroke-width="2.5"/>
      <rect x="262" y="90" width="16" height="58" rx="5" fill="#1e293b" stroke="${accent}" stroke-width="2.5"/>
      <rect x="276" y="80" width="22" height="78" rx="6" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
    `,
    yoga: `
      <ellipse cx="155" cy="125" rx="22" ry="42" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <ellipse cx="155" cy="125" rx="10" ry="20" fill="${accent}"/>
      <path d="M155 83 L278 83 C292 83, 298 167, 278 167 L155 167 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
    `,
    racket: `
      <ellipse cx="192" cy="95" rx="44" ry="52" fill="none" stroke="${accent}" stroke-width="6"/>
      <line x1="162" y1="75" x2="222" y2="75" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="154" y1="95" x2="230" y2="95" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="162" y1="115" x2="222" y2="115" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="175" y1="50" x2="175" y2="140" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="192" y1="45" x2="192" y2="145" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="209" y1="50" x2="209" y2="140" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="224" y1="132" x2="275" y2="185" stroke="#0f172a" stroke-width="10" stroke-linecap="round"/>
      <line x1="224" y1="132" x2="275" y2="185" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
    `,
    bottle: `
      <rect x="192" y="42" width="36" height="18" rx="4" fill="#0f172a" stroke="${accent}" stroke-width="2.5"/>
      <path d="M174 72 L190 58 L230 58 L246 72 L246 184 C246 192, 174 192, 174 184 Z" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
      <line x1="174" y1="92" x2="246" y2="92" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
    `,
    cosmetics: `
      <rect x="194" y="45" width="32" height="24" rx="4" fill="#0f172a" stroke="${accent}" stroke-width="2.5"/>
      <rect x="172" y="70" width="76" height="115" rx="16" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
      <rect x="184" y="96" width="52" height="54" rx="6" fill="#ffffff" opacity="0.92"/>
      <line x1="194" y1="115" x2="226" y2="115" stroke="#0f172a" stroke-width="3"/>
      <line x1="198" y1="128" x2="222" y2="128" stroke="${accent}" stroke-width="2.5"/>
    `,
    styler: `
      <rect x="194" y="45" width="32" height="145" rx="14" fill="url(#screenGrad)" stroke="${accent}" stroke-width="3"/>
      <rect x="198" y="55" width="24" height="38" rx="6" fill="#0f172a"/>
      <circle cx="210" cy="112" r="6" fill="${accent}"/>
      <circle cx="210" cy="130" r="5" fill="#ffffff"/>
    `
  };

  const safeTitle = title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeBrand = brand.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCat = category.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const shortTitle = safeTitle.length > 34 ? safeTitle.slice(0, 32) + '...' : safeTitle;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 280" width="600" height="400">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
      <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="420" height="280" fill="url(#bgGrad)"/>
    <circle cx="350" cy="50" r="95" fill="${accent}" opacity="0.12"/>
    <circle cx="70" cy="220" r="85" fill="${accent}" opacity="0.1"/>
    <rect x="18" y="16" width="110" height="24" rx="12" fill="#0f172a" opacity="0.65"/>
    <text x="73" y="32" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-size="10" font-weight="700" fill="${accent}" text-anchor="middle">${safeBrand.toUpperCase()}</text>
    <rect x="292" y="16" width="110" height="24" rx="12" fill="#0f172a" opacity="0.45"/>
    <text x="347" y="32" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle">${safeCat}</text>
    ${icons[iconType] || icons.smartphone}
    <rect x="24" y="216" width="372" height="48" rx="12" fill="#0f172a" opacity="0.78" stroke="${accent}" stroke-width="1" stroke-opacity="0.4"/>
    <text x="210" y="245" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-size="13.5" font-weight="700" fill="#f8fafc" text-anchor="middle">${shortTitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

module.exports = { createProductImage };
