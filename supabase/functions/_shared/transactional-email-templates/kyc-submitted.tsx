import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, card, footer } from './_styles.ts'

interface Props { name?: string; boutiqueName?: string }

const KycSubmitted = ({ name, boutiqueName }: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Vos documents de vérification ont bien été reçus</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Vérification d'identité</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>{name ? `Merci, ${name}` : 'Merci'}</Heading>
            <Text style={text}>
              Nous avons bien reçu vos documents{boutiqueName ? ` pour la boutique « ${boutiqueName} »` : ''}.
            </Text>
            <Section style={card}>
              <Text style={{ ...text, margin: 0 }}>
                <strong>Délai de traitement :</strong> 24 à 72 heures ouvrées.
                Vous recevrez un email dès que votre dossier aura été examiné.
              </Text>
            </Section>
            <Text style={text}>
              En attendant, vous pouvez continuer à préparer votre boutique et vos produits.
            </Text>
          </Section>
          <Section style={footer}>Brand-In-A-Box · Vérification</Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: KycSubmitted,
  subject: 'Documents reçus — vérification en cours',
  displayName: 'KYC reçu',
  previewData: { name: 'Marie', boutiqueName: 'Atelier Solène' },
} satisfies TemplateEntry