/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, button, card, footer } from './_styles.ts'

interface Props {
  name?: string
  stepLabel?: string
  stepDescription?: string
  stepUrl?: string
  attemptNo?: number
  totalSteps?: number
  doneSteps?: number
}

const OnboardingStuckReminder = ({
  name,
  stepLabel = 'Finaliser votre configuration',
  stepDescription = "Quelques étapes restent à compléter pour lancer votre boutique.",
  stepUrl = 'https://brand-in-a-box.space/dashboard',
  attemptNo = 1,
  totalSteps,
  doneSteps,
}: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Reprenez votre onboarding Brand-In-A-Box là où vous l'avez laissé</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Your brand. Ready to launch.</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>
              {name ? `${name}, on continue ?` : 'On continue votre onboarding ?'}
            </Heading>
            <Text style={text}>
              Votre configuration n'est pas tout à fait finie. Encore une étape clé pour rendre
              votre boutique opérationnelle.
            </Text>
            <Section style={card}>
              <Text style={{ ...text, margin: 0, fontWeight: 600 }}>{stepLabel}</Text>
              <Text style={{ ...text, margin: '6px 0 0', fontSize: 14 }}>{stepDescription}</Text>
              {typeof totalSteps === 'number' && typeof doneSteps === 'number' && (
                <Text style={{ ...text, margin: '10px 0 0', fontSize: 12, color: '#6B7280' }}>
                  Progression : {doneSteps} / {totalSteps} étapes terminées
                </Text>
              )}
            </Section>
            <Section style={{ textAlign: 'center' as const, margin: '20px 0 8px' }}>
              <Button href={stepUrl} style={button}>Reprendre maintenant</Button>
            </Section>
            <Text style={{ ...text, fontSize: 12, color: '#6B7280', marginTop: 24 }}>
              Vous recevez ce message car votre onboarding est en pause depuis plus de 48 heures
              (relance {attemptNo}/3). Vous pouvez désactiver ces rappels depuis votre Dashboard.
            </Text>
          </Section>
          <Section style={footer}>Brand-In-A-Box · Commerce OS</Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: OnboardingStuckReminder,
  subject: 'Reprenez votre onboarding Brand-In-A-Box',
  displayName: 'Relance onboarding bloqué',
  previewData: {
    name: 'Marie',
    stepLabel: 'Créer votre première boutique',
    stepDescription: 'Choisissez un nom, une catégorie et un slug public.',
    stepUrl: 'https://brand-in-a-box.space/dashboard/boutiques/create',
    attemptNo: 1,
    totalSteps: 5,
    doneSteps: 2,
  },
} satisfies TemplateEntry