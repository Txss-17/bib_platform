import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, button, card, footer } from './_styles.ts'

interface Props {
  sellerName?: string
  orderNumber?: string
  customerName?: string
  amount?: string
  productName?: string
  ordersUrl?: string
}

const NewOrderNotification = ({ sellerName, orderNumber, customerName, amount, productName, ordersUrl = 'https://brand-in-a-box.space/dashboard/commandes' }: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Nouvelle commande {orderNumber ?? ''}</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Nouvelle commande</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>{sellerName ? `Bonne nouvelle, ${sellerName} !` : 'Bonne nouvelle !'}</Heading>
            <Text style={text}>Vous avez reçu une nouvelle commande sur votre boutique.</Text>
            <Section style={card}>
              {orderNumber && <Text style={{ ...text, margin: '0 0 6px' }}><strong>Commande :</strong> {orderNumber}</Text>}
              {customerName && <Text style={{ ...text, margin: '0 0 6px' }}><strong>Client :</strong> {customerName}</Text>}
              {productName && <Text style={{ ...text, margin: '0 0 6px' }}><strong>Produit :</strong> {productName}</Text>}
              {amount && <Text style={{ ...text, margin: 0 }}><strong>Montant :</strong> {amount} €</Text>}
            </Section>
            <Text style={text}>
              La logistique est prise en charge automatiquement. Pensez à valider la commande
              dans votre tableau de bord pour démarrer la préparation.
            </Text>
            <Button href={ordersUrl} style={button}>Voir la commande</Button>
          </Section>
          <Section style={footer}>Brand-In-A-Box · Notifications vendeur</Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: NewOrderNotification,
  subject: (d: Record<string, any>) => `Nouvelle commande${d.orderNumber ? ` ${d.orderNumber}` : ''}`,
  displayName: 'Nouvelle commande (vendeur)',
  previewData: { sellerName: 'Marie', orderNumber: 'BIB26-A1B2C3', customerName: 'Paul Durand', amount: '49.90', productName: 'Bougie parfumée' },
} satisfies TemplateEntry