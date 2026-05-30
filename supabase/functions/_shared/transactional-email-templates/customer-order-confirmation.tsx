import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, button, card, footer } from './_styles.ts'

interface Props {
  customerName?: string
  orderNumber?: string
  amount?: string
  productName?: string
  boutiqueName?: string
  trackingUrl?: string
}

const CustomerOrderConfirmation = ({ customerName, orderNumber, amount, productName, boutiqueName, trackingUrl = 'https://brand-in-a-box.space/suivi' }: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Commande confirmée{orderNumber ? ` (${orderNumber})` : ''}</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>{boutiqueName || 'Brand-In-A-Box'}</Heading>
            <Text style={tagline}>Confirmation de commande</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>{customerName ? `Merci, ${customerName} !` : 'Merci pour votre commande !'}</Heading>
            <Text style={text}>
              Votre commande a bien été enregistrée. Nous préparons votre colis avec soin
              et vous tiendrons informé(e) à chaque étape.
            </Text>
            <Section style={card}>
              {orderNumber && <Text style={{ ...text, margin: '0 0 6px' }}><strong>Numéro :</strong> {orderNumber}</Text>}
              {productName && <Text style={{ ...text, margin: '0 0 6px' }}><strong>Produit :</strong> {productName}</Text>}
              {amount && <Text style={{ ...text, margin: 0 }}><strong>Total :</strong> {amount} €</Text>}
            </Section>
            <Button href={trackingUrl} style={button}>Suivre ma commande</Button>
            <Text style={{ ...text, fontSize: '13px', color: '#6B7280', marginTop: '20px' }}>
              Une question ? Répondez simplement à cet email, votre boutique vous répondra sous 48h.
            </Text>
          </Section>
          <Section style={footer}>
            {boutiqueName ? `${boutiqueName} · ` : ''}Propulsé par Brand-In-A-Box
          </Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: CustomerOrderConfirmation,
  subject: (d: Record<string, any>) => `Commande confirmée${d.orderNumber ? ` — ${d.orderNumber}` : ''}`,
  displayName: 'Confirmation client (fallback)',
  previewData: { customerName: 'Paul', orderNumber: 'BIB26-A1B2C3', amount: '49.90', productName: 'Bougie parfumée', boutiqueName: 'Atelier Solène' },
} satisfies TemplateEntry