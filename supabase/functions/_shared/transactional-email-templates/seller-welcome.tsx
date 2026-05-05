import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, button, footer } from './_styles.ts'

interface Props { name?: string; dashboardUrl?: string }

const SellerWelcome = ({ name, dashboardUrl = 'https://brand-in-a-box.space/dashboard' }: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Bienvenue sur Brand-In-A-Box — votre boutique vous attend</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Your brand. Ready to launch.</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>{name ? `Bienvenue, ${name} !` : 'Bienvenue !'}</Heading>
            <Text style={text}>
              Votre compte vendeur est créé. Vous pouvez désormais lancer votre première boutique
              en quelques minutes : choisir vos produits, personnaliser votre identité, et publier.
            </Text>
            <Text style={text}>
              Notre plateforme prend en charge la logistique. Vous gardez le contrôle de votre marque
              et de la relation client.
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
  component: SellerWelcome,
  subject: 'Bienvenue sur Brand-In-A-Box',
  displayName: 'Bienvenue vendeur',
  previewData: { name: 'Marie' },
} satisfies TemplateEntry