import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const activities = [
  {
    name: "BIB account (customer or merchant)",
    purpose: "Create and secure an account; manage preferences and access.",
    basis: "Contract performance or pre-contractual steps; legal obligations for mandatory evidence.",
    action: "Present terms of use and privacy information before registration; record their versions and the validation action. No preselected marketing consent.",
    recipients: "Authorised BIB team, authentication providers and, for merchants, other approved personnel."
  },
  {
    name: "Order, payment and delivery",
    purpose: "Process orders, confirm payments and arrange delivery through BIB partners.",
    basis: "Sales contract with the merchant; statutory invoicing and retention duties; legitimate interests for fraud prevention where justified.",
    action: "Before ordering, disclose the professional seller, price, guarantees, data recipients and applicable conditions.",
    recipients: "Selling merchant, BIB within its role, payment provider and logistics partners, limited to necessary data."
  },
  {
    name: "Pre-launch survey",
    purpose: "Understand barriers to trust in e-commerce, desired BIB features and interest in selling.",
    basis: "Express consent before submitting an optional survey.",
    action: "Do not submit responses without a separate unticked checkbox; rejection and closing the survey must have no adverse effect.",
    recipients: "Product Engineering analyses results; Marketplace receives aggregated statistics, not named response lists."
  },
  {
    name: "BIB Talent",
    purpose: "Review expressions of interest, the chosen discipline and opportunities for follow-up.",
    basis: "The current form collects consent; the specific basis for handling recruitment must be aligned to the proposed legal relationship.",
    action: "Provide information about required data, retention and withdrawal within the voluntary application form.",
    recipients: "HR/Talent coordination, with controlled referral to the relevant function only after authorisation and HR qualification."
  },
  {
    name: "BIB assistant and support tickets",
    purpose: "Answer enquiries, diagnose difficulties and pass a case to human support when requested.",
    basis: "Service performance or a suitably assessed legitimate interest, depending on the purpose.",
    action: "Inform the user about AI assistance; open support tickets only after explicit positive confirmation. Avoid unnecessary sensitive information.",
    recipients: "Authorised BIB support and necessary technical providers. Conversation data and attachments must not become public."
  },
  {
    name: "Email and advertising",
    purpose: "Send transaction messages, support merchants' campaigns and measure results through authorised connected networks.",
    basis: "Contract or legal obligation for service email; consent or another applicable basis for marketing; prior consent for non-exempt advertising trackers.",
    action: "Separate mandatory and promotional messages; make unsubscribing and withdrawal easy. No ad-network connection or spend without an authorised action.",
    recipients: "BIB, the merchant controlling its campaign and selected providers under suitable processing agreements."
  }
] as const;

export function EnglishConsentCharter() {
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/pack-legal" className="text-sm font-medium text-primary underline">Back to the legal centre</Link>
      <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Personal data and consent</h1>
      <p className="mt-2 text-xs text-muted-foreground">Draft version: 2 November 2026 · Information subject to review before any final contractual publication.</p>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">BIB is developing a platform for customers, merchants, suppliers, logistics partners and BIB Talent applicants. Providing information to BIB does not authorise unlimited use. Each processing activity requires a defined purpose, suitable legal basis, justified retention period and authorised recipients.</p>

      <section className="mt-7 rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Three different decisions</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          <li><strong>Accepting a contract or terms of use:</strong> agreeing to obligations concerning the service requested.</li>
          <li><strong>Receiving GDPR information:</strong> understanding necessary processing, which may rely on a contract or legal requirement rather than consent.</li>
          <li><strong>Giving optional consent:</strong> authorising a purpose requiring permission (such as optional surveys, certain marketing or non-essential cookies). No preselected checkbox; withdrawal must be possible.</li>
        </ol>
      </section>

      <section className="mt-7 space-y-3 rounded-xl border border-border bg-card p-4 text-sm leading-7 sm:p-6">
        <h2 className="text-lg font-semibold">Offers, visitor identifiers and location</h2>
        <p>A browser identifier does not on its own reveal a visitor's email address or civil identity. Cookie preferences do not subscribe someone to marketing offers; neither does acceptance of sales terms or terms of use.</p>
        <p>Offer subscriptions require a separate unticked opt-in and then confirmation of the email address. The responsible sender and scope are disclosed: BIB or one specified store. Subscriptions are not automatically shared with other stores or partners. Records include the purpose, agreed text and version, a record identifier and request, confirmation and withdrawal dates.</p>
        <p>These forms do not collect precise location, device fingerprints or browsing histories. Any future location-based or identifier-based targeting requires its own disclosures and applicable choices. Technical data needed for sign-in or security has a separate purpose and retention period.</p>
        <p><Link to="/communications" className="underline">Choose BIB email offers</Link>. Every promotional email includes an unsubscribe link for the named sender. Account and order service messages are separate.</p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Overview of BIB processing activities</h2>
        {activities.map(item => <article key={item.name} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-base font-semibold">{item.name}</h3>
          <dl className="mt-3 space-y-2 text-sm leading-6">
            <div><dt className="inline font-semibold">Purpose: </dt><dd className="inline">{item.purpose}</dd></div>
            <div><dt className="inline font-semibold">Lawful basis: </dt><dd className="inline">{item.basis}</dd></div>
            <div><dt className="inline font-semibold">Before submission: </dt><dd className="inline">{item.action}</dd></div>
            <div><dt className="inline font-semibold">Recipients: </dt><dd className="inline">{item.recipients}</dd></div>
          </dl>
        </article>)}
      </section>
      <section className="mt-8 space-y-3 rounded-xl border border-border bg-card p-5 text-sm leading-7">
        <h2 className="text-lg font-semibold">How BIB documents choices</h2>
        <p>Where consent is required, BIB must proportionately retain the notice version, purpose, choice, date and an appropriate technical record identifier. Refusals and withdrawals must be honoured; withdrawal does not retroactively make previously lawful processing unlawful.</p>
        <p>Account, order and accounting data can have different retention periods. BIB Talent applications are retained for the relevant recruitment purpose. Where an applicant separately agrees to future opportunities, the candidate pool may retain their file for up to two years. Any intranet copy must respect the same deadline. Cookie choices must be purpose-specific and stored for an appropriate duration.</p>
        <p>Closing an account does not automatically remove records that must be retained by law. Requests for access, correction, erasure, restriction, objection and portability are evaluated under the applicable legal conditions. Optional consent can be withdrawn at any time.</p>
        <p><strong>Data protection contact:</strong> <a href="mailto:privacy@brand-in-a-box.space" className="underline">privacy@brand-in-a-box.space</a> (operability to be verified). Complaints may be lodged with the French data protection authority (CNIL).</p>
      </section>
      <section className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm leading-7">
        <h2 className="text-base font-semibold">Information still to be verified by the operator</h2>
        <p>The legal identity of the operator, representative, registered address, registration records, exact recipients and processor agreements must be checked against official documentation. The operation of deletion, GDPR export, cookies and consent features must be tested: a written notice does not establish that these features work.</p>
      </section>
    </main>
    <Footer />
  </div>;
}

export function EnglishMerchantDataAnnex() {
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/pack-legal" className="text-sm text-primary underline">Back to the legal centre</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">Draft contractual addendum · 2 November 2026</p>
      <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Store customer data and merchant responsibilities</h1>
      <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-6"><strong>Working document:</strong> the parties' identities, technical architecture and legal terms require approval before signature. This draft does not constitute an executed data processing agreement.</p>
      <article className="mt-6 space-y-6 rounded-xl border border-border bg-card p-5 text-sm leading-7 sm:p-7">
        <section><h2 className="text-lg font-semibold">1. Parties and scope</h2>
          <p>The professional merchant operates the store and remains the legal seller to its customers. Where BIB hosts, stores or transfers customer data solely under the merchant's documented instructions, the merchant may be the controller and BIB the processor within the meaning of GDPR Article 28. Where BIB determines its own purposes (platform security, account administration, fraud prevention or legal compliance), it may be a separate controller. Actual roles must be determined for each processing activity.</p></section>
        <section><h2 className="text-lg font-semibold">2. Data and individuals concerned</h2>
          <p>Store customers: identity, contact and address details, ordered products, delivery records, after-sales correspondence and authorised preferences. Sensitive payment instrument data should not be unnecessarily stored by BIB where the payment provider manages those instruments. Any additional categories need proper notice and justification.</p></section>
        <section><h2 className="text-lg font-semibold">3. Documented instructions and purposes</h2>
          <p>For processing carried out on behalf of a merchant, BIB only processes data for contracted functions and under documented instructions, unless applicable law requires otherwise. Campaign creation, email, export or analytics features do not grant BIB general permission to reuse merchants' customer data for BIB advertising.</p></section>
        <section><h2 className="text-lg font-semibold">4. Confidentiality, access and security</h2>
          <p>BIB must restrict staff permissions, segregate stores' data, implement database and storage access controls, maintain appropriate logs, control administrator access and verify encryption and recovery. Merchants must likewise secure their teams' access and notify BIB of compromises.</p></section>
        <section><h2 className="text-lg font-semibold">5. Subprocessors and transfers</h2>
          <p>Potential providers include hosting, payment, email and logistics services. Any contractual list of subprocessors, processing countries, notification arrangements and transfer mechanisms outside the EEA must be maintained in a current operational appendix. Displaying this draft does not constitute general subprocessor authorisation.</p></section>
        <section><h2 className="text-lg font-semibold">6. Rights, incidents and cooperation</h2>
          <p>Within the scope of its role and capabilities, BIB must help merchants respond to data subject requests, manage incidents, document security measures and perform required assessments. Personal data breaches must be reported to the controller without undue delay after discovery, with available information. Notifications to regulators or affected people depend on the incident assessment and each party's legal role.</p></section>
        <section><h2 className="text-lg font-semibold">7. Retention and termination</h2>
          <p>Termination must address return or deletion of data processed for the merchant, subject to justified backups and statutory retention. Exact periods, export methods, logs and evidence of erasure belong in the operational appendices.</p></section>
        <section><h2 className="text-lg font-semibold">8. Controls and records</h2>
          <p>A definitive agreement should set out audits, compliance records, processing categories, technical and organisational safeguards, subprocessors, instructions and allocation of responsibilities. The store's consumer sales terms are separate from this proposed addendum.</p></section>
      </article>
      <p className="mt-5 text-xs text-muted-foreground">This draft reflects commonly used e-commerce data processing agreement structures but does not copy third-party contractual clauses.</p>
    </main>
    <Footer />
  </div>;
}
