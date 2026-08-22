export type Locale = "id" | "en";

export interface DivisionItem {
  number: string;
  icon: "building" | "layers" | "cpu";
  image: string;
  name: string;
  intro: string;
  items: string[];
}

export interface Content {
  meta: { title: string; description: string };
  nav: {
    about: string;
    divisions: string;
    advantages: string;
    contact: string;
    contactCta: string;
  };
  hero: {
    eyebrow: string;
    titlePre: string;
    titleHighlight: string;
    titlePost: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageAlt: string;
    stats: { value: string; label: string }[];
  };
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    valuesLabel: string;
    values: { name: string; description: string }[];
    visionLabel: string;
    vision: string;
    missionLabel: string;
    missions: string[];
  };
  divisions: {
    eyebrow: string;
    heading: string;
    lead: string;
    items: DivisionItem[];
  };
  advantages: {
    eyebrow: string;
    heading: string;
    items: string[];
    compliance: {
      eyebrow: string;
      heading: string;
      items: string[];
      commitmentHeading: string;
      commitment: string[];
    };
  };
  sectors: { eyebrow: string; heading: string; items: string[] };
  contact: {
    eyebrow: string;
    heading: string;
    lead: string;
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      companyLabel: string;
      companyPlaceholder: string;
      categoryLabel: string;
      categoryOther: string;
      messageLabel: string;
      messagePlaceholder: string;
      submitLabel: string;
      sendingLabel: string;
      successMessage: string;
      errorMessage: string;
      unconfiguredMessage: string;
      emailSubject: string;
    };
    infoTitle: string;
    addressLabel: string;
    emailLabel: string;
  };
  footer: { navTitle: string; contactTitle: string; copyright: string };
}
