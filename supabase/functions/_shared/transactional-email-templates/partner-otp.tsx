/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, card, footer } from './_styles.ts'

interface Props { code?: string; portal?: string; minutes?: number }

const PartnerOtp = ({ code = '------', portal = 'partenaire', minutes = 10 }: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Votre code de vérification Brand-In-A-Box</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Portail {portal}</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>Votre code de vérification</Heading>
            <Text style={text}>
              Saisissez ce code dans votre onboarding pour valider votre adresse email :
            </Text>
            <Section style={{ ...card, textAlign: 'center' as const }}>
              <Text style={{ fontSize: 32, fontWeight: 700, letterSpacing: 8, margin: 0, color: '#0b1d3a' }}>
                {code}
              </Text>
            </Section>
            <Text style={text}>
              Ce code expire dans <strong>{minutes} minutes</strong>. Si vous n'êtes pas à l'origine de cette demande,
              ignorez simplement cet email.
            </Text>
          </Section>
          <Section style={footer}>Brand-In-A-Box · Sécurité</Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: PartnerOtp,
  subject: 'Votre code Brand-In-A-Box',
  displayName: 'Code OTP partenaire',
  previewData: { code: '482913', portal: 'fournisseur', minutes: 10 },
} satisfies TemplateEntry