export const csvEscape=(v)=>`"${String(v??'').replace(/"/g,'""')}"`;
export function toCsv(rows){return rows.map(r=>r.map(csvEscape).join(',')).join('\n')}
