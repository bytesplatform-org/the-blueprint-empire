/**
 * Every fact and copy string on the home page, copied verbatim from
 * docs/reference/blueprint-empire.html and from the home page of the client's
 * live site (theblueprintempire.co). Components render from here; don't edit
 * copy in the components.
 */

export type Link = { label: string; href: string };

const BLOB = "https://img1.wsimg.com/blobby/go/1b843c67-b2ad-4cc9-b555-0017dcae5fdc/";

/** The client's live site: pages this one-page site doesn't carry link there. */
export const SITE = "https://theblueprintempire.co";

const REFERRAL_FORM = "https://docs.google.com/forms/u/0/d/103gqKZBbqk9FexDz_5-eN45k65OQdQ2RRMSbcwg2Zfg/viewform";

export const brand = {
  mark: "BE",
  name: "Blueprint Empire",
  sub: "CORPORATION",
  homeLabel: "Blueprint Empire home",
  short: "Blueprint Empire Corp.",
  legal: "Blueprint Empire Corporation",
  sequence: ["Structure", "Skills", "Opportunity", "Legacy"],
};

export const meta = {
  title: "Blueprint Empire Corp",
  description:
    "Blueprint Empire Corp delivers government-ready training programs, reentry education, workforce development, entrepreneurship training and curriculum design for federal, state and community agencies.",
};

export const capabilityStatement =
  "https://drive.google.com/file/d/1ko47y1yXvt74UPXI-oVxgZGehfvgNwmD/view?usp=drivesdk";

export const nav = {
  links: [
    { label: "What we do", href: "#pillars" },
    { label: "Programs", href: "#programs" },
    { label: "For agencies", href: "#agencies" },
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Founder", href: "#founder" },
    { label: "Contact", href: "#contact" },
  ] satisfies Link[],
  cta: { label: "Partner with us", href: "#contact" },
};

/** Section ids and sheet numbers, in page order. */
export const sheets = {
  hero: { id: "hero", sheet: "A-01" },
  intro: { id: "intro", sheet: "A-02" },
  pillars: { id: "pillars", sheet: "A-03" },
  programs: { id: "programs", sheet: "A-04" },
  capabilities: { id: "capabilities", sheet: "A-05" },
  agencies: { id: "agencies", sheet: "A-06" },
  ecosystem: { id: "ecosystem", sheet: "A-07" },
  impact: { id: "impact", sheet: "A-08" },
  blog: { id: "blog", sheet: "A-09" },
  founder: { id: "founder", sheet: "A-10" },
  mission: { id: "mission", sheet: "A-11" },
  contact: { id: "contact", sheet: "A-12" },
  shop: { id: "shop", sheet: "A-13" },
} as const;

export const loader = {
  label: "Loading Blueprint Empire",
  word: "Drafting",
  status: ["Setting type", "Compiling shaders", "Laying foundations", "Squaring the grid"],
};

export const hero = {
  kicker: "Government-ready training · Business development",
  /** the live site's headline, set above the three lines */
  name: "Blueprint Empire™",
  title: "Building Businesses. Developing Leaders. Creating Opportunities.",
  /** each line: a hollow verb + a filled noun; dir drives entrance, drift and lean */
  lines: [
    { hollow: "Building", filled: "Businesses.", dir: 1 },
    { hollow: "Developing", filled: "Leaders.", dir: -1 },
    { hollow: "Creating", filled: "Opportunities.", dir: 1 },
  ],
  lede: {
    before: "Blueprint Empire Corp designs and delivers ",
    strong: "structured training programs, reentry education, workforce development and entrepreneurship curricula",
    after: " for federal, state and community agencies.",
  },
  ctas: {
    explore: { label: "Explore Our Ecosystem", href: "#ecosystem" },
    primary: { label: "View program catalog", href: "#programs" },
    secondary: { label: "Capability statement ↗", href: capabilityStatement },
  },
};

/** The section that rises over the hero: the three lines set on a ring, and the project credentials. */
export const statement = {
  ring: "Building Businesses · Developing Leaders · Creating Opportunities · ",
  credentials: [
    { k: "Project", v: "Blueprint Empire Corp." },
    { k: "Prepared for", v: "Federal · State · Community" },
    { k: "UEI", v: "SM2VWN6B2A34", copy: true },
    { k: "Delivery", v: "Virtual / In person" },
  ],
};

/** "Who We Are" and "Partner With Us", from the live site; set under the credentials. */
export const about = {
  heading: "Who We Are",
  lead: "Blueprint Empire™ helps entrepreneurs, professionals, and organizations build lasting success through business development, workforce initiatives, education, and strategic partnerships.",
  body: "We create opportunities that strengthen businesses, careers, and communities.",
  nsba: {
    seal: "NSBA",
    body: "Proud Member of the National Small Business Association (NSBA) Leadership Council, advocating for entrepreneurs, workforce development, and small business growth nationwide.",
  },
  partner: {
    label: "Partner With Us",
    heading: "Creating Opportunities Together",
    cta: { label: "Become a Referral Partner", href: REFERRAL_FORM },
  },
};

export const ticker = [
  "Reentry education",
  "Workforce development",
  "Curriculum design",
  "Entrepreneurship training",
  "Financial literacy",
  "Job readiness",
  "Project coordination",
  "Business startup support",
];

export const intro = {
  heading: ["Every program is", "built from the ground up."],
  body: "Participants move through four stages, the same way a building rises from its footing. Scroll to raise the structure.",
  stages: [
    { title: "Structure", body: "Curriculum, lesson plans and instructor guidance are in place before the first session." },
    { title: "Skills", body: "Instructor-led training in financial literacy, job readiness and entrepreneurship." },
    { title: "Opportunity", body: "Resumes, interviews, pitches and business plans that open real doors." },
    { title: "Legacy", body: "Certified graduates, measurable outcomes and businesses built to last." },
  ],
  figure: {
    label: "Elevation drawing of a civic building rising from its foundation",
  },
};

export const foundations = {
  heading: ["Three foundations,", "one structure."],
  body: "A training and business development partner for agencies running high-impact community initiatives.",
  items: [
    {
      image: { src: "/images/foundations/workforce.jpg", alt: "A job interview across a desk: one woman takes notes while the other answers", aspect: 1600 / 1067 },
      title: "Workforce development",
      body: "Employment preparation that builds professional skills and moves participants into real job opportunities.",
      points: ["Job readiness training", "Resume, application and interview skills", "Retention and career advancement pathways"],
    },
    {
      image: { src: "/images/foundations/entrepreneurship.jpg", alt: "A founder presents to a seated room in an open office", aspect: 1600 / 900 },
      title: "Entrepreneurship",
      body: "Training and startup support that helps people launch, structure and grow a business of their own.",
      points: ["Business startup support", "Pitch and presentation development", "Financial literacy and credit building"],
    },
    {
      image: { src: "/images/foundations/community.jpg", alt: "An instructor leads a training session for a classroom of adults", aspect: 1600 / 1067 },
      title: "Government & community programs",
      body: "Contract-ready curricula with structured modules, measurable outcomes and agency reporting.",
      points: ["Reentry education for returning citizens", "Federal, state and local agency delivery", "Outcome tracking and certificates"],
    },
  ],
};

export type Bar = { from: number; to: number; label?: string; ext?: boolean };
export type Program = {
  id: string;
  name: string;
  meta: string;
  /** grid columns on the 8-week scale, CSS grid-column style (to is exclusive) */
  bars: Bar[];
  body: string;
  links: Link[];
} & ({ includes: string[]; weeks?: never } | { weeks: string[]; includes?: never });

export const programs = {
  heading: ["Curricula built", "to a schedule."],
  body: "Four ready-to-deliver programs, drawn to scale by week. Open any program to see its structure, what agencies receive and the full curriculum packet.",
  scaleLabel: "Program",
  weeks: 8,
  items: [
    {
      id: "p1",
      name: "Business Reentry Academy™",
      meta: "Reentry · Workforce · 8 weeks",
      bars: [{ from: 1, to: 9, label: "8 WK" }],
      body: "A complete reentry and workforce development curriculum for returning citizens, justice-involved individuals and agency reentry initiatives. The packet includes learning objectives, weekly lesson plans, instructor guidance, workforce skill-building activities, agency reporting requirements and measurable outcomes, prepared for agency review, compliance verification and procurement evaluation.",
      links: [
        { label: "Curriculum packet ↗", href: `${BLOB}Government%20pdf.pdf` },
        { label: "Certificate sample ↗", href: `${BLOB}Certificate%20pdf.pdf` },
      ],
      includes: [
        "Full 8-week curriculum",
        "Instructor-led training",
        "Workbooks & journals",
        "Outcome tracking & reporting",
        "Certificates of completion",
        "Virtual or in-person delivery",
      ],
    },
    {
      id: "p2",
      name: "Financial Literacy Boot Camp",
      meta: "Intensive · 4 weeks",
      bars: [{ from: 1, to: 5, label: "4 WK" }],
      body: "An accelerated program that builds financial stability, confidence and long-term independence. It supports returning citizens, youth and justice-involved individuals by improving financial decision-making, budgeting skills and income growth strategies, with credit-building activities and financial assessments.",
      links: [
        { label: "Curriculum packet ↗", href: `${BLOB}Financial%20literacy%20four%20week%20course.pdf` },
        { label: "Certificate sample ↗", href: `${BLOB}Financial%20literacy%20certificate%20of%20completion.pdf` },
      ],
      includes: [
        "Full 4-week curriculum",
        "Instructor-led training",
        "Financial worksheets & journal",
        "Outcome tracking & reporting",
        "Certificate of completion",
        "Virtual or in-person delivery",
      ],
    },
    {
      id: "p3",
      name: "Job Readiness & Workforce Development",
      meta: "Employment prep · 4–6 weeks",
      bars: [
        { from: 1, to: 5, label: "4 WK" },
        { from: 5, to: 7, ext: true },
      ],
      body: "Structured employment preparation that helps participants gain workforce skills, build a resume, improve communication and prepare for real job opportunities, including how to discuss background or employment gaps professionally.",
      links: [
        { label: "Curriculum packet ↗", href: `${BLOB}Job%20readiness.pdf` },
        { label: "Certificate sample ↗", href: `${BLOB}Job%20readiness%20certificate%20of%20completion.pdf` },
      ],
      weeks: [
        "Professional identity & workplace expectations",
        "Resume building & job application skills",
        "Interviewing & communication skills",
        "Job search, retention & advancement",
      ],
    },
    {
      id: "p4",
      name: "Pitch Game™",
      meta: "Entrepreneurship · 8 weeks · 16–20 hrs",
      bars: [{ from: 1, to: 9, label: "8 WK" }],
      body: "An entrepreneurship and presentation program that takes participants from a business idea, nonprofit concept or program proposal to a polished 3–5 minute pitch and a professional 8-slide deck. Standard cohorts run 10–30 participants, up to 40. Materials include a student workbook, instructor guide, templates, assessment forms and attendance sheets.",
      links: [
        { label: "Curriculum overview ↗", href: `${BLOB}Pitch%20game%20curriculum%20overview.pdf` },
        { label: "Certificate sample ↗", href: `${BLOB}Pitch%20game%20certificate%20of%20completion.pdf` },
      ],
      weeks: [
        "What a pitch is: structure & mindset",
        "Idea development & value proposition",
        "8-slide pitch deck structure",
        "Storytelling & confidence techniques",
        "Visual slide creation",
        "Voice, tone, pace & stage presence",
        "Final pitch deck polishing",
        "Final presentation & certification",
      ],
    },
  ] satisfies Program[] as Program[],
  includesHeading: "Program includes",
  weeksHeading: "Weekly structure",
  legend: {
    core: "Core weeks",
    ext: "Optional extension",
    every: "Every program: instructor-led · outcome reporting · certificate",
  },
};

export type IconName = "design" | "digital" | "startup" | "workforce" | "coordination" | "admin";

export const capabilities = {
  heading: ["From curriculum", "to coordination."],
  body: "Beyond our catalog, we build custom training and support the people who run programs. Scalable, curriculum-based solutions designed around your mission.",
  items: [
    { icon: "design", title: "Instructional design", body: "Learning objectives, lesson plans and instructor guides built for consistent delivery." },
    { icon: "digital", title: "Digital learning materials", body: "Training modules, workbooks, journals, worksheets and templates in print or digital form." },
    { icon: "startup", title: "Business startup support", body: "Structure, branding and launch guidance for new entrepreneurs and small businesses." },
    { icon: "workforce", title: "Workforce programs", body: "Job readiness, reentry and skills training tailored to the population you serve." },
    { icon: "coordination", title: "Project coordination", body: "Scheduling, cohort management and delivery coordination from kickoff to graduation." },
    { icon: "admin", title: "Administrative support", body: "Attendance tracking, assessments, outcome reporting and documentation for agency records." },
  ] satisfies { icon: IconName; title: string; body: string }[],
};

export const agencies = {
  heading: ["Ready for", "procurement."],
  body: "Contracting data, classification codes and review documents in one place, so your team can evaluate us quickly.",
  /** The engraved credential seal (guilloche, as on bonds and certificates). Facts only. */
  seal: {
    ring: "Blueprint Empire Corporation · UEI SM2VWN6B2A34 · Contract Training Provider · ",
    tags: ["UEI SM2VWN6B2A34", "NAICS 611430 · 624310 · 611699 · 541611"],
    caption: "Registered and classified for federal, state and community contracting. Move across the seal and it catches the light.",
  },
  spec: {
    legalEntity: "Blueprint Empire Corporation",
    uei: "SM2VWN6B2A34",
    contractingContact: "Victoria Harris, CEO · Contract Training Provider",
    naics: [
      { code: "611430", label: "Professional & management development training" },
      { code: "624310", label: "Vocational rehabilitation services" },
      { code: "611699", label: "All other miscellaneous schools & instruction" },
      { code: "541611", label: "Administrative & general management consulting" },
    ],
    capabilities: "Reentry training · workforce development · entrepreneurship · job readiness · financial literacy",
    membership: "National Small Business Association (NSBA) Leadership Council",
  },
  process: [
    { title: "Scope the population", body: "We confirm who you serve, cohort size, delivery format and the outcomes your agency reports on." },
    { title: "Match or adapt a curriculum", body: "Start from a catalog program or have us design structured modules for your initiative." },
    { title: "Deliver, virtual or in person", body: "Instructor-led sessions with workbooks, attendance sheets and assessments." },
    { title: "Report measurable outcomes", body: "Outcome tracking, evaluation tools and certificates of completion for every graduate." },
  ],
  documents: [
    { label: "Capability statement ↗", href: capabilityStatement, primary: true },
    { label: "Price sheet ↗", href: `${BLOB}Government%20price%20sheet.pdf` },
    { label: "Federal service menu ↗", href: `${BLOB}Government%20service%20menu.pdf` },
  ] as (Link & { primary?: boolean })[],
};

export const ecosystem = {
  label: "Our Ecosystem",
  heading: ["One corporation.", "Seven ways in."],
  body: [
    "Blueprint Empire™ is a business development ecosystem designed to help individuals, entrepreneurs, nonprofits, and organizations grow through education, workforce development, strategic partnerships, publishing, media, and entrepreneurship. We turn ideas into opportunities and opportunities into impact.",
    "Each brand reaches people at a different point, from reentry to pitching a first business to building wealth across generations.",
  ],
  core: "EMPIRE",
  brandsHeading: "Our Brands & Initiatives",
  brandsSub: "Building opportunities through business, workforce, and community impact.",
  brands: [
    { short: "CORP", name: "Blueprint Empire™ Corporation", tag: "Business Development & Strategic Growth" },
    { short: "FC2C", name: "From Convict to Corporate Inc.", tag: "Workforce Development & Reentry Services" },
    { short: "BWA", name: "Blueprint Workforce Alliance™", tag: "Employer & Community Partnerships" },
    { short: "PITCH", name: "The Pitch Room™", tag: "Business & Pitch Development" },
    { short: "PODCAST", name: "Mommie & Me Podcast™", tag: "Family & Entrepreneurship Conversations" },
    { short: "BLOG", name: "Blueprint Empire Blog™", tag: "Education & Business Resources" },
    { short: "PARTNERS", name: "Community & Workforce Partnerships", tag: "Strategic Community Engagement" },
  ],
};

export const impact = {
  heading: ["Impact Across", "Our Ecosystem"],
  body: "Blueprint Empire™ supports entrepreneurs, nonprofits, workforce programs, authors, creators, and community leaders through education, strategy, and opportunity.",
  logo: { src: "/images/ecosystem/from-convict-to-corporate.png", alt: "From Convict to Corporate™", width: 935, height: 311 },
  growth: {
    heading: "Built for Growth",
    items: [
      "Business Development",
      "Workforce Solutions",
      "Publishing & Media",
      "Entrepreneurship Education",
      "Strategic Partnerships",
      "Community Impact",
    ],
  },
};

export type Post = { date: string; title: string; excerpt: string; href: string };

export const blog = {
  heading: ["Blueprint Empire Blog"],
  body: "At Blueprint Empire™, we share powerful insights to help entrepreneurs build lasting success. From ready-to-sell business kits and brand-building strategies to funding tips and marketing tools, our blog is your blueprint to growth. Every article is designed to equip you with real-world solutions so you can rise above trends and create a business that lasts.",
  more: "Continue Reading",
  // The excerpts are cut where the live site cuts them.
  posts: [
    {
      date: "July 5, 2026",
      title: "From Convict to Corporate Celebrates Its First Graduation",
      excerpt: "From Convict to Corporate Celebrates Its First Graduating Class in Baton Rouge",
      href: `${SITE}/f/from-convict-to-corporate-celebrates-its-first-graduation`,
    },
    {
      date: "September 5, 2025",
      title: "Welcome to blueprint Empire",
      excerpt: "Welcome to Blueprint Empire™ Blog",
      href: `${SITE}/f/empire-blog`,
    },
    {
      date: "August 9, 2025",
      title: "5 Reasons Entrepreneurs Love Blueprint Empire Kits",
      excerpt: "1. Time-Saving – No need to spend months figuring out branding and setup.\n2. Professional Design – High-quality logos, marketing flyers, and templates included.\n3. Business Plan Ready – You get a clear launch roadma...",
      href: `${SITE}/f/5-reasons-entrepreneurs-love-blueprint-empire-kits`,
    },
    {
      date: "August 9, 2025",
      title: "How to Launch a Business in 30 Days with a Ready-to-Go Kit",
      excerpt: "Starting a business doesn’t have to take months or even years. With our Blueprint Empire Ready-to-Go Kits, you can have a brand name, logo, marketing materials, and a launch plan in your hands within 30 days. We handle t...",
      href: `${SITE}/f/how-to-launch-a-business-in-30-days-with-a-ready-to-go-kit`,
    },
  ] satisfies Post[],
};

export const founder = {
  // TODO(client): portrait photo. The monogram below is a placeholder.
  initials: "VH",
  name: "Victoria Harris",
  role: "Founder & CEO",
  attribution: "Founder & CEO · Author & speaker",
  /** the quote in two lines; `mark` is highlighted in brass */
  quote: [
    [{ text: "“Every visionary deserves" }],
    [{ text: "a clear path", mark: true }, { text: " to success.”" }],
  ] as { text: string; mark?: boolean }[][],
  quoteText: "“Every visionary deserves a clear path to success.”",
  story:
    "Victoria built Blueprint Empire after facing challenges, rebuilding and learning firsthand what structure makes possible. The company exists to remove barriers, so people with ambition get the direction, tools and support to turn it into income and impact.",
  values: [
    { title: "Innovation", body: "Set the standard, not the trend." },
    { title: "Excellence", body: "Quality in every deliverable." },
    { title: "Access", body: "High-level tools for everyone." },
    { title: "Legacy", body: "Built to last for generations." },
  ],
};

export const mission = {
  heading: ["Our Mission"],
  body: "At Blueprint Empire™, we empower visionaries to launch, scale, and protect their brands with ready-to-launch business kits. From concept to market, we deliver strategies, resources, and investor-ready solutions that transform bold ideas into profitable empires.",
};

/** "You Don’t Need More Ideas — You Need Structure.", in its stanzas */
export const structure = {
  heading: ["You Don’t Need More Ideas —", "You Need Structure."],
  stanzas: [
    ["Most people don’t fail because they lack ambition…", "They fail because they lack direction."],
    ["At Blueprint Empire™, everything is built to eliminate confusion,", "save time, and position you for real income."],
    ["This isn’t guesswork.", "This is a blueprint."],
  ],
};

export const contact = {
  label: "Contact Us",
  heading: ["Let's draw up", "your program."],
  body: "Government contracts, program inquiries and referral partnerships. Sessions are available in person or virtually.",
  email: "blueprint@theblueprintempire.co",
  phone: "(307) 269-9324",
  // TODO(client): confirm primary address. The reference lists both offices
  // because the client's own site disagrees about which one is primary.
  offices: "Houston, TX 77004 · Denham Springs, LA",
  hours: "09:00 am – 05:00 pm",
  cheer: "✨ Let’s build your empire today!",
  referral: {
    label: "Become a referral partner ↗",
    href: REFERRAL_FORM,
  },
  /** the live site's location card */
  visit: {
    name: "Blueprint Empire",
    address: "Denham Springs, LA, USA",
    servicing: "Servicing Denham Spring and Surrounding Areas",
    delivery: "In person or virtual",
    directions: { label: "Get directions ↗", href: "https://www.google.com/maps/dir/?api=1&destination=Denham+Springs%2C+LA%2C+USA" },
    map: {
      src: "https://maps.google.com/maps?q=Denham%20Springs%2C%20LA%2C%20USA&z=12&output=embed",
      href: "https://www.google.com/maps/search/?api=1&query=Denham+Springs%2C+LA%2C+USA",
      title: "Map of Denham Springs, LA",
    },
  },
  form: {
    inquiryTypes: ["Government contract", "Community program", "Business development", "Referral partnership"],
    programs: [
      { value: "Business Reentry Academy", label: "Reentry Academy" },
      { value: "Financial Literacy Boot Camp", label: "Financial Literacy" },
      { value: "Job Readiness", label: "Job Readiness" },
      { value: "Pitch Game", label: "Pitch Game" },
      { value: "Custom curriculum", label: "Custom curriculum" },
    ],
    detailsPlaceholder: "Population served, cohort size, timeline, delivery format",
    attach: "Attach Files",
    attachHint: "Up to 5 files, 4 MB in total.",
    tooBig: "Those files are over 4 MB together. Send fewer, or email them to blueprint@theblueprintempire.co.",
    attachFallback: "Attach your files to that email.",
    submit: "Send inquiry",
    invalid: "Add your name and a valid email address so we can reply.",
    fallback: "Email your inquiry to blueprint@theblueprintempire.co to reach our team.",
    /** shown only after the server confirms delivery (not in the reference, which never sent) */
    sent: "Your inquiry was sent. We'll reply by email.",
    openDraft: "Open it in your email app ↗",
  },
};

/** "Subscribe": the Empire Insider List */
export const insider = {
  heading: "Subscribe",
  body: "“Join the Empire Insider List – Get exclusive updates, new kit launches, and special offers delivered straight to your inbox.”",
  field: "Email Address",
  submit: "Sign Up",
  invalid: "Add a valid email address.",
  /** shown only after the server confirms delivery */
  sent: "You’re on the list.",
  fallback: "Email blueprint@theblueprintempire.co to join the list.",
  openDraft: "Open it in your email app ↗",
};

export type Product = { name: string; href: string; image: { src: string; alt: string }; was?: string; price: string; ribbon?: string };

export const products = {
  heading: "Featured Products",
  items: [
    {
      name: "Closing Like A CEO",
      href: `${SITE}/shop/ols/products/closing-like-a-ceo`,
      image: { src: "/images/shop/closing-like-a-ceo.jpg", alt: "Closing Like A CEO: The Business Sales Playbook, by Victoria Harris" },
      ribbon: "Sale",
      was: "$20.00",
      price: "$15.00",
    },
    {
      name: "Empire Goals",
      href: `${SITE}/shop/ols/products/empire-goals`,
      image: { src: "/images/shop/empire-goals.jpg", alt: "Empire Goals: Setting a Grand Vision for Your Business, by Victoria Harris" },
      ribbon: "Sale",
      was: "$20.00",
      price: "$15.00",
    },
  ] satisfies Product[],
  all: { label: "View All Products", href: `${SITE}/shop/ols/products` },
};

export const footer = {
  /** the line above the panel; "Build your empire" is the client's own line */
  lead: { text: "Build your empire.", follow: "Follow along", handle: "@authorvictoriaharris", href: "https://www.instagram.com/authorvictoriaharris" },
  label: "Blueprint",
  wordmark: ["Blueprint"],
  legal: "© 2026 Blueprint Empire Corporation",
  info: ["Open 09:00 am – 05:00 pm.", "Houston, TX 77004 · Denham Springs, LA", "UEI SM2VWN6B2A34"],
  legalLinks: [
    { label: "Privacy policy", href: `${SITE}/privacy-policy` },
    { label: "Terms and Conditions", href: `${SITE}/terms-and-conditions` },
  ] satisfies Link[],
  work: { title: "Work with us", body: "Government contracts, program inquiries and referral partnerships." },
  hello: "Say hello",
  social: [
    { label: "Facebook ↗", href: "https://www.facebook.com/share/1GjMXgEYjz/" },
    { label: "Instagram ↗", href: "https://www.instagram.com/authorvictoriaharris" },
  ] satisfies Link[],
  back: { label: "Back to top ↑", href: "#top" },
};
