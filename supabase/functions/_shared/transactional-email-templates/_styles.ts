// Brand-In-A-Box brand tokens for emails
export const BIB = {
  marine: '#0F2540',
  marineDeep: '#0A1A2E',
  gold: '#C99846',
  goldSoft: '#E6C988',
  ivory: '#FAF6EE',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
}
export const wrapper = { backgroundColor: BIB.ivory, padding: '32px 16px' }
export const container = {
  backgroundColor: '#ffffff',
  maxWidth: '560px',
  margin: '0 auto',
  borderRadius: '12px',
  overflow: 'hidden',
  border: `1px solid ${BIB.border}`,
}
export const header = {
  backgroundColor: BIB.marine,
  padding: '28px 32px',
  textAlign: 'center' as const,
}
export const brand = {
  color: BIB.gold,
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '22px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  margin: 0,
}
export const tagline = {
  color: '#ffffff',
  opacity: 0.7,
  fontSize: '12px',
  margin: '4px 0 0',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
}
export const body = { padding: '32px' }
export const h1 = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '24px',
  color: BIB.marine,
  margin: '0 0 16px',
  lineHeight: 1.3,
}
export const text = {
  fontSize: '15px',
  color: BIB.text,
  lineHeight: 1.6,
  margin: '0 0 16px',
}
export const button = {
  display: 'inline-block',
  backgroundColor: BIB.gold,
  color: BIB.marine,
  fontWeight: 600,
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  margin: '12px 0',
}
export const card = {
  backgroundColor: BIB.ivory,
  border: `1px solid ${BIB.border}`,
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
}
export const footer = {
  padding: '20px 32px 28px',
  fontSize: '12px',
  color: BIB.muted,
  textAlign: 'center' as const,
  borderTop: `1px solid ${BIB.border}`,
}