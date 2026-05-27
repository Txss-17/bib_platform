/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, card, footer } from './_styles.ts'

interface Props {
  company?: string
  portal?: string
  portalUrl?: string
  ticketNumber?: string
}

const PartnerOnboardingSubmitted = ({
  company = 'votre société',
  portal = 'partenaire',
  portalUrl = 'https://brand-in-a-box.space',
  ticketNumber,
}: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Votre dossier d'onboarding a bien été soumis</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Portail {portal}</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>Dossier reçu</Heading>
            <Text style={text}>
              Merci. Le dossier d'onboarding de <strong>{company}</strong> est désormais en file d'instruction
              auprès de notre équipe Ops.
            </Text>
            <Section style={card}>
              <Text style={{ ...text, margin: 0 }}>
                <strong>Suivi en temps réel.</strong> Consultez l'état de votre dossier (documents reçus,
                conformité validée, intégration, pilote, go-live) ou modifiez vos informations à tout moment
                via le lien ci-dessous.
              </Text>
            </Section>
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button
                href={portalUrl}
                style={{
                  backgroundColor: '#0b1d3a',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Accéder à mon dossier
              </Button>
            </Section>
            {ticketNumber && (
              <Text style={{ ...text, fontSize: 12, color: '#777' }}>
                Référence interne : <strong>{ticketNumber}</strong>
              </Text>
            )}
          </Section>
          <Section style={footer}>Brand-In-A-Box · Onboarding partenaire</Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: PartnerOnboardingSubmitted,
  subject: 'Dossier reçu — suivi de votre onboarding',
  displayName: 'Onboarding partenaire soumis',
  previewData: {
    company: 'Atelier Solène',
    portal: 'fournisseur',
    portalUrl: 'https://brand-in-a-box.space/portal/onboarding/demo',
    ticketNumber: 'BIB-DEMO',
  },
} satisfies TemplateEntry