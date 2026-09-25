import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, button, footer } from './_styles.ts'

interface Props { name?: string; productName?: string; dashboardUrl?: string }

const SubscriptionConfirmed = ({ name, productName = 'votre abonnement', dashboardUrl = 'https://brand-in-a-box.space/dashboard' }: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>{`${productName} est actif sur Brand-In-A-Box`}</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Your brand. Ready to launch.</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>{name ? `Merci, ${name} !` : 'Merci !'}</Heading>
            <Text style={text}>
              Votre souscription à <strong>{productName}</strong> est confirmée et active dès maintenant.
              Les avantages associés sont déjà débloqués dans votre espace.
            </Text>
            <Text style={text}>
              Vous pouvez changer de plan ou résilier à tout moment depuis vos paramètres.
            </Text>
            <Button href={dashboardUrl} style={button}>Accéder à mon tableau de bord</Button>
          </Section>
          <Section style={footer}>Brand-In-A-Box · Commerce OS</Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionConfirmed,
  subject: (d: Record<string, any>) => `${d.productName ?? 'Votre abonnement'} est actif`,
  displayName: 'Abonnement confirmé',
  previewData: { name: 'Marie', productName: 'BIB Growth' },
} satisfies TemplateEntry
