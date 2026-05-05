import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { main, wrapper, container, header, brand, tagline, body, h1, text, button, footer, card } from './_styles.ts'

interface Props {
  name?: string
  subject?: string
  status?: 'in_progress' | 'resolved' | 'closed' | 'open'
  trackingUrl?: string
  ticketId?: string
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Ouvert',
  in_progress: 'En cours de traitement',
  resolved: 'Résolu',
  closed: 'Fermé',
}

const STATUS_MESSAGE: Record<string, string> = {
  in_progress: "Notre équipe a pris en charge votre demande. Nous revenons vers vous très bientôt.",
  resolved: "Bonne nouvelle ! Votre demande est résolue. Si tout est OK pour vous, vous n'avez rien à faire.",
  closed: "Votre ticket a été fermé. N'hésitez pas à en ouvrir un nouveau si besoin.",
  open: "Nous avons bien reçu votre demande.",
}

const SupportTicketStatus = ({
  name,
  subject = 'Votre demande',
  status = 'in_progress',
  trackingUrl = 'https://brand-in-a-box.space/dashboard/aide',
  ticketId,
}: Props) => (
  <Html lang="fr">
    <Head />
    <Preview>Votre ticket support — {STATUS_LABEL[status] ?? status}</Preview>
    <Body style={main}>
      <Section style={wrapper}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h2" style={brand}>Brand-In-A-Box</Heading>
            <Text style={tagline}>Support</Text>
          </Section>
          <Section style={body}>
            <Heading as="h1" style={h1}>
              {name ? `${name}, ` : ''}votre ticket est {STATUS_LABEL[status]?.toLowerCase() ?? status}
            </Heading>
            <Text style={text}>{STATUS_MESSAGE[status]}</Text>
            <Section style={card}>
              <Text style={{ ...text, margin: 0 }}><strong>Sujet :</strong> {subject}</Text>
              {ticketId && (
                <Text style={{ ...text, margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Référence : {ticketId.slice(0, 8).toUpperCase()}
                </Text>
              )}
            </Section>
            <Button href={trackingUrl} style={button}>Voir le suivi</Button>
          </Section>
          <Section style={footer}>Brand-In-A-Box · Support client</Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const template = {
  component: SupportTicketStatus,
  subject: (data: Record<string, any>) => {
    const label = STATUS_LABEL[data?.status] ?? 'mis à jour'
    return `Votre ticket support est ${label.toLowerCase()}`
  },
  displayName: 'Support — changement de statut',
  previewData: {
    name: 'Marie',
    subject: 'Question sur ma commande',
    status: 'in_progress',
    trackingUrl: 'https://brand-in-a-box.space/dashboard/aide',
    ticketId: 'abcdef12-3456-7890-abcd-ef1234567890',
  },
} satisfies TemplateEntry