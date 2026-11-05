import { CookieSettingsButton } from "@/components/privacy/CookieConsentManager";

/**
 * English explanatory rendering of BIB's draft public legal notices.
 * Source drafts remain in French; legal review is required before any
 * translation is represented as a binding or finally approved contract.
 * This component does NOT translate seller-specific legal bundles.
 */
export function EnglishLegalNotices() {
  return <>
    <p className="rounded-lg border border-amber-300/40 bg-amber-50/50 p-3 text-sm text-foreground"><strong>Draft status:</strong> this text is an English rendering of the draft BIB Legal Notices v1.1 (November 2026). Mandatory registration and hosting details must be substantiated and reviewed before sales begin. A company that has not been incorporated is not the current publisher.</p>
    <h2>Publisher and responsibility</h2>
    <p>Brand-in-a-Box (“BIB”) develops a digital platform for merchants, customers, suppliers and operating partners. The legally responsible publisher must be identified by the <strong>individual entrepreneur’s full legal name, professional address, contact details, SIREN/SIRET business identifiers, relevant RNE/RCS registration details and VAT number where applicable</strong>. Share capital and a company president must not be invented for an individual entrepreneur. All identification details are awaiting supporting evidence.</p>
    <p><strong>Proposed initial legal arrangement:</strong> BIB would initially operate through an individual business under the French micro-entrepreneur tax and social regime, subject to checking its current administrative status and declaring the appropriate activity. A separate SASU company may be incorporated later; none is deemed to exist today. The proposed transition is not evidence of registration, reactivation or contractual transfer. Correct mandatory information about the actual operator must be published before any live sales.</p>
    <p>Where the French VAT exemption for small businesses applies, invoicing must follow its applicable statutory wording. The micro-enterprise regime alone does not establish VAT exemption. A merchant's invoices for products and BIB's invoices for its own services must identify their actual respective issuers.</p>
    <p>Website: <strong>brand-in-a-box.space</strong>. General enquiries: <a href="mailto:contact@brand-in-a-box.space">contact@brand-in-a-box.space</a> (operability to be confirmed). Legal: <a href="mailto:legal@brand-in-a-box.space">legal@brand-in-a-box.space</a>. Personal data: <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>.</p>
    <h2>Publication director and hosting</h2>
    <p>The publication director's name and the legal name, address and contact details of the actual contractual hosting provider must be verified and added before live commercial use. Using development, deployment or database services such as Lovable or Supabase does not, by itself, establish who the legal hosting provider is.</p>
    <h2>Role in sales</h2>
    <p>For <strong>third-party merchants' stores</strong>, the legally identified merchant is the professional seller, while BIB acts as intermediary under the applicable agreements. For <strong>test stores operated by BIB's individual entrepreneur</strong>, that entrepreneur is the seller; internal stores have no separate legal personality or registration and cannot invoice subscriptions or commissions to themselves. Consumers' mandatory rights apply against the legally identified seller regardless of BIB's service role.</p>
    <h2>Content, intellectual property and reports</h2>
    <p>Trademarks, software and creative materials are protected to the extent that BIB holds or is licensed to use the relevant rights. Store content may belong to merchants or other rightsholders. To report unlawful content, misuse or request the exercise of legal rights, contact the legal address above.</p>
    <h2>Consumer mediation</h2>
    <p>Consumers must be given the details of the <strong>consumer mediator actually appointed by the seller</strong> for their purchase. No mediator has been verified for these drafts; BIB must not state that an organisation is appointed until an effective agreement exists. Mediation does not exclude court remedies or statutory guarantees.</p>
    <h2>Other information</h2>
    <p>See the <a href="/cgu">terms of use</a>, <a href="/cgv">general sales information</a>, <a href="/confidentialite">privacy policy</a> and <a href="/donnees-et-consentements">data and consent notice</a>. For a sale, the store must also display the actual selling merchant's mandatory legal and contractual details.</p>
  </>;
}

export function EnglishLegalPrivacy() {
  return <>
    <p className="text-sm text-muted-foreground">Draft English rendering based on BIB Privacy Policy v1.2, November 2026. Processing roles, retention periods, actual subprocessors and contact details must be verified before contractual publication.</p>
    <p>This policy covers the BIB platform, stores published through BIB, support requests, pre-launch surveys and BIB Talent. It is supplemented by the <a href="/donnees-et-consentements">data and consent notice</a> and the information presented with each form.</p>
    <h2>1. Controllers and contacts</h2>
    <p>The legally identified BIB operator acts as controller for processing it determines for its own services. Its complete identity must be published in the <a href="/mentions-legales">legal notices</a>. For certain store-customer processing, the selling merchant may be controller, while BIB may act as processor, separate controller or, subject to an assessment, joint controller. Roles must be determined for each purpose and documented in the relevant agreements, including data processing agreements (DPAs) where required.</p>
    <p>Data privacy contact: <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a> (availability to be confirmed).</p>
    <h2>2. People and data categories</h2>
    <ul>
      <li><strong>Visitors:</strong> necessary technical logs, language preferences, cookie choices and optional survey responses.</li>
      <li><strong>Customers:</strong> account information, email addresses, delivery addresses, orders, payment and return records, preferences and support correspondence.</li>
      <li><strong>Merchants and partners:</strong> professional identity, contact details, eligibility evidence, catalogue and store information, billing, order and after-sales files, and access rights.</li>
      <li><strong>BIB Talent:</strong> name, email, area of activity, preferred team, skills, motivation, availability and optional work samples.</li>
      <li><strong>Assistance:</strong> questions submitted to the AI assistant, information shared in conversations and tickets confirmed by the user; avoid sharing unnecessary sensitive information.</li>
      <li><strong>Advertising:</strong> merchant campaign drafts, indicative budgets and, only after authorised activation, connected advertising-account identifiers and statistics.</li>
    </ul>
    <h2>3. Purposes and lawful bases</h2>
    <p>Account creation and order management may rely on contract performance or pre-contractual steps; invoicing and certain checks on legal obligations; security and fraud prevention on legitimate interests where a balancing test supports this; optional surveys on consent. Recruitment applications rely on an appropriate basis for assessing applications, while retention for future openings requires a separate appropriate basis. Marketing and non-essential trackers are governed by their own rules.</p>
    <p>Completing a form or accepting terms of use does not turn all uses of data into consent-based processing. Optional consent is separate from contractual acceptance and can be withdrawn where applicable.</p>
    <h2>4. Recipients and data flows</h2>
    <p>Stripe has been selected as the intended payment provider. This does not mean that Stripe Connect or multi-party payment flows are operational. BIB's GDPR role is assessed by processing purpose, rather than assumed from its hosting of a store.</p>
    <p>Only authorised BIB personnel may access information needed for their duties. The selling merchant, logistics and payment providers, infrastructure providers, support and approved processors receive only necessary information. Survey results shared outside Product Engineering must be aggregated. BIB Talent application information is initially restricted to HR/Talent, with controlled sharing to the relevant team when justified.</p>
    <p>Confidential documents must not be placed in publicly accessible folders. Transfers outside the European Economic Area require assessment and an appropriate transfer mechanism where applicable. Providers' locations and contractual safeguards remain to be verified.</p>
    <h2>5. Retention periods</h2>
    <p>Retention is purpose-specific, including for BIB Talent applications, supplier evidence, intranet logs, audit records and backups. Retaining governance decisions does not justify indefinite retention of personal data. Tax and accounting retention obligations are separate from marketing consent.</p>
    <p>Accounts are retained as necessary for the service and outstanding obligations; legal and accounting records follow applicable periods. The platform currently envisages a 180-day retention period for BIB Talent application files, which must be reflected in intranet processes. Survey responses are analysed in aggregate. Security logs, tickets and cookie choices require proportionate documented retention. A single retention period must not be applied to all data.</p>
    <h2>6. Security, automation and AI</h2>
    <p>BIB aims to implement role-based access, server-side controls, limited permissions, suitable logs and managed retention, subject to actual testing. The AI assistant does not create a support ticket without explicit confirmation and must not independently decide on recruitment, terminations or denial of rights. Automated decisions with similarly significant legal effects would require additional safeguards and disclosures.</p>
    <h2>7. Your rights and withdrawal</h2>
    <p>Subject to legal conditions, you may request access, rectification, erasure, restriction, objection or portability. Optional consent may be withdrawn at any time without retroactively affecting lawful prior processing. Contact <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>; you may also complain to the French data protection authority, the CNIL.</p>
    <h2>8. Communications and cookies</h2>
    <p>Messages necessary for security, authentication, an order or provision of the service are not the same as promotional communications. Marketing emails require an appropriate lawful basis and an appropriate objection or unsubscribe mechanism. Non-essential trackers are used only after a valid choice where required; see the <a href="/cookies">cookie policy</a>.</p>
    <p>Optional offer subscriptions require a separate opt-in followed by email address confirmation. Each subscription concerns BIB or one named store and its identified sender; it is not automatically shared with other senders. A visit identifier, acceptance of terms or account creation does not subscribe you. Each promotional email provides an unsubscribe mechanism without stopping necessary service messages.</p>
    <p>Subscription evidence includes the email address, sender, purpose, accepted text and version, dates and record identifier. It is not enriched with device fingerprints, geolocation or browsing journeys. A store may select offers based on purchases with that store if disclosed upon enrolment. Subscriptions expire after three years without a new sign-up; unconfirmed requests are kept for no more than seven days. Evidence of withdrawal or expiry is kept for up to a further three years to document the choice. Send logs and backups require separately approved retention periods.</p>
    <h2>9. Changes</h2>
    <p>Material changes to a processing purpose require updated information and, where necessary, renewed consent for the new purpose. Applicable versions and dates must remain traceable.</p>
  </>;
}

export function EnglishLegalCookies() {
  return <>
    <p className="text-sm text-muted-foreground">Draft English rendering based on BIB Cookie Policy v1.1 (November 2026). The full inventory of deployed trackers and actual consent-manager behaviour must be verified against the published version.</p>
    <h2>1. Necessary cookies and storage</h2>
    <p>Authentication, security, session continuity, cart functionality and the storage of an explicit choice may require technical storage. When strictly necessary for the service requested, such storage does not require cookie consent, but its purpose must still be explained.</p>
    <p><CookieSettingsButton className="rounded-md border border-border px-4 py-2 text-sm font-semibold" /></p>
    <h2>2. Audience measurement and advertising</h2>
    <p>Non-exempt statistics cookies, advertising pixels, conversion trackers and similar technologies must remain blocked until a valid choice has been obtained. Future Meta Ads or Google Ads integrations would require a new assessment of trackers, recipients, retention and any international transfers.</p>
    <h2>3. Available choices</h2>
    <p>Purposes must be assessed individually: strictly necessary account, cart and security storage; audience measurement only if an exemption genuinely applies; and non-exempt analytics, advertising or third-party trackers subject to prior choice where required. A payment tool's trackers are not automatically all consent-based; their actual purposes must be assessed.</p>
    <p>The consent panel offers <strong>Accept all</strong>, <strong>Reject all</strong> and <strong>Customize</strong> with rejection as easy as acceptance. Store analytics and external media are disabled by default. Continuing to browse or closing the panel does not constitute consent. Optional settings are applied only when explicitly saved.</p>
    <p>The permanent <strong>Manage cookies</strong> button, also available in BIB and store footers, lets users change purposes or withdraw consent. Withdrawal stops subsequent analytics events and removes external players or maps from the page; it does not retroactively erase data already transmitted. Cookie choices are separate from terms of sale, terms of use and marketing emails.</p>
    <h3>Purposes controlled by this panel</h3>
    <ul>
      <li><strong>Necessary:</strong> Supabase sign-in session, menu state (the <code>sidebar_state</code> cookie, seven days), technical migration marker and remembered cookie choice. Cart operation does not depend on optional cookie agreement.</li>
      <li><strong>Store analytics:</strong> after permission, BIB records visits, product views, clicks and interactions through its Supabase-hosted service. A visit identifier stays in memory during the page; activity predating the choice is not replayed.</li>
      <li><strong>External media:</strong> YouTube (Google), Vimeo and Google Maps when present. Without permission no player or map connects to those services. With permission, providers may receive your IP address and place their own trackers under their policies: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google / YouTube</a> and <a href="https://vimeo.com/privacy" target="_blank" rel="noreferrer">Vimeo</a>. Their retention and transfer terms require verification before activation.</li>
      <li><strong>Advertising:</strong> this manager does not activate any Meta Ads or Google Ads pixel. Adding a provider or purpose requires updated information, a new panel version and loading checks before use.</li>
    </ul>
    <h2>4. Duration and control</h2>
    <p>Proof of the choice must be retained proportionately. Remembering acceptance and rejection for six months reflects common French CNIL guidance, subject to a context-specific assessment. Actual suppliers, trackers, purposes and retention periods must be inventoried and kept current; browser settings alone do not replace a compliant consent mechanism where consent is required.</p>
    <p>Choices are stored locally under <code>bib:platform:cookie-consent:v1</code> with their purposes, date, six-month expiry and notice version <code>2026-11-05.1</code>, without a personal identifier added by the panel. When a choice expires or the notice becomes obsolete, a new choice is required and optional purposes stay off in the meantime. If local storage is blocked, the choice applies only to the current page. It is not automatically shared across devices, domains or Intrabib.</p>
    <h2>5. Contact and more information</h2>
    <p>Questions: <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>. See the <a href="/confidentialite">privacy policy</a> and <a href="/donnees-et-consentements">data and consent notice</a>.</p>
  </>;
}
