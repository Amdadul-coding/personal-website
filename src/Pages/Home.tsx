import type { ReactNode } from 'react';
import styles from '../styles/home.module.css';
import profile from '../assets/profile.jpg';
import githubLogo from '../assets/github.png';
import linkedinLogo from '../assets/linkedin.png';
import emailLogo from '../assets/email.png';
import projectBrightness from '../assets/brightnessController.jpg';
import projectFitness from '../assets/everything-fitness-preview.png';
import resume from '../assets/resume.pdf';
import resumePreview from '../assets/resume-preview.png';
import ContactWidget from '../Components/ContactWidget';
import Background from '../Components/Background';
import Nav from '../Components/Nav';
import Typewriter from '../Components/Typewriter';
import Counter from '../Components/Counter';
import useReveal from '../hooks/useReveal';
import useTilt from '../hooks/useTilt';
import useMagnetic from '../hooks/useMagnetic';

const roles = [
  'Software Engineer',
  'Systems Developer',
  'Full-Stack Developer',
  'Distributed Systems Builder',
];

const expertise = [
  'Distributed Systems',
  'Real-Time & Event-Driven Systems',
  'Go Microservices',
  'React & React Native',
  'REST APIs',
  'NATS Messaging',
  'JWT Auth',
  'Observability',
  'Cross-platform Development',
  'Full-stack Web Development',
];

const stats = [
  { value: 2, suffix: '+', label: 'Years shipping software' },
  { value: 5, suffix: '', label: 'Go services instrumented' },
  { value: 140, suffix: '', label: 'Rooms streaming real-time' },
  { value: 1422, suffix: '', label: 'Exercises served via API' },
];

const orbitChips = ['Go', 'React', 'TypeScript', 'Python', 'SQL'];

type ExperienceProps = {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  tags: string[];
};

type SocialProps = {
  name: string;
  link: string;
  logo: string;
  placeholder: string;
};

type ProjectProps = {
  previewImage: string;
  link: string;
  openInNewTab?: boolean;
  title: string;
  description: string;
  stack: string[];
};

function SectionHeading({ index, children }: { index: string; children: ReactNode }) {
  return (
    <h1 className={styles.sectionTitle} data-reveal>
      <span className={styles.sectionIndex} aria-hidden="true">{index}</span>
      {children}
    </h1>
  );
}

function SocialDetail({ name, link, logo, placeholder }: SocialProps) {
  const isEmail = link.startsWith('mailto:');
  const magnetic = useMagnetic<HTMLAnchorElement>();

  return (
    <a
      ref={magnetic.ref}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      className={styles.socialButton}
      href={link}
      target={isEmail ? undefined : '_blank'}
      rel={isEmail ? undefined : 'noopener noreferrer'}
      aria-label={isEmail ? 'Email Amdadul Haque (opens your mail app)' : `${name} (opens in a new tab)`}
      title={name}
    >
      {logo ? <img src={logo} alt="" /> : <span aria-hidden="true">{placeholder}</span>}
    </a>
  );
}

function ProjectsDetail(projectProps: ProjectProps) {
  const tilt = useTilt<HTMLAnchorElement>();

  return (
    <a
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={`${styles.glassCard} ${styles.tiltCard} ${styles.projectCard}`}
      href={projectProps.link || undefined}
      target={projectProps.openInNewTab ? '_blank' : undefined}
      rel={projectProps.openInNewTab ? 'noopener noreferrer' : undefined}
      aria-label={projectProps.openInNewTab ? `${projectProps.title} (opens in a new tab)` : undefined}
    >
      <div className={styles.projectPreview}>
        {projectProps.previewImage ? (
          <img src={projectProps.previewImage} alt={`${projectProps.title} preview`} loading="lazy" />
        ) : (
          <span className={styles.projectPlaceholder}>Add project preview</span>
        )}
      </div>
      <div className={styles.projectContent}>
        <div className={styles.projectHeading}>
          <h2 className={styles.projectTitle}>{projectProps.title}</h2>
          {projectProps.link && <span className={styles.projectArrow} aria-hidden="true">↗</span>}
        </div>
        <p className={styles.projectDescription}>{projectProps.description}</p>
        <ul className={styles.chipList} aria-label="Technology stack">
          {projectProps.stack.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </div>
    </a>
  );
}

function ExperiencesDetail({ experience, delay }: { experience: ExperienceProps; delay: number }) {
  const tilt = useTilt<HTMLDivElement>(3);

  return (
    <li className={styles.timelineItem} data-reveal style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}>
      <span className={styles.timelineNode} aria-hidden="true" />
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={`${styles.glassCard} ${styles.tiltCard} ${styles.experienceCard}`}
      >
        <div className={styles.experienceHeader}>
          <div>
            <h2 className={styles.experienceTitle}>{experience.title}</h2>
            <p className={styles.experienceCompany}>
              {experience.company}
              <span className={styles.experienceDivider} aria-hidden="true">·</span>
              {experience.location}
            </p>
          </div>
          <span className={styles.experiencePeriod}>{experience.period}</span>
        </div>
        <p className={styles.experienceDescription}>{experience.description}</p>
        <ul className={styles.chipList} aria-label="Technologies">
          {experience.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      </div>
    </li>
  );
}

export default function Home() {
  useReveal();
  const resumeTilt = useTilt<HTMLAnchorElement>(5);

  const allSocials: Record<string, SocialProps> = {
    linkedin: {
      name: 'LinkedIn',
      link: 'https://www.linkedin.com/in/amdadul-haque-837b37308/',
      logo: linkedinLogo,
      placeholder: 'in',
    },
    github: {
      name: 'GitHub',
      link: 'https://github.com/Amdadul-coding',
      logo: githubLogo,
      placeholder: 'GH',
    },
    email: {
      name: 'Email',
      link: 'mailto:amdadul1123@gmail.com',
      logo: emailLogo,
      placeholder: '@',
    },
  };

  const allProjects: Record<string, ProjectProps> = {
    everythingFitness: {
      previewImage: projectFitness,
      link: 'https://everythingfitness.onrender.com/',
      openInNewTab: true,
      title: 'Everything Fitness',
      description: 'Built a full-stack fitness app that helps users find exercises by muscle group and workout location, with animated previews and step-by-step guides. A Go REST API filters an embedded JSON exercise catalog, with automated deployments on Render.',
      stack: ['React', 'TypeScript', 'Go'],
    },
    project1: {
      previewImage: projectBrightness,
      link: 'https://github.com/Amdadul-coding/monitor-brightness-controller',
      openInNewTab: true,
      title: 'Brightness Controller',
      description: 'Built an app for controlling external monitor brightness and automating daily brightness schedules, so I never have to fiddle with monitor buttons again. A Python REST API and macOS background service drive the monitor over DDC/CI.',
      stack: ['React Native', 'TypeScript', 'Python'],
    },
  };

  const allExperiences: ExperienceProps[] = [
    {
      title: 'Systems Developer',
      company: 'LiNK',
      location: 'Irvine, CA',
      period: 'Aug 2025 – Present',
      description: 'Build and ship full-stack software across distributed backend systems, real-time applications, and production integrations. Secured Go services with RS256 JWT middleware, replaced unstructured logs with leveled JSON logging and request-ID tracing across HTTP and NATS, delivered an 11-page company website from Figma to production, and engineered Python BACnet automation that streams device state across 140 rooms in real time.',
      tags: ['Go', 'React Native', 'Python', 'NATS', 'JWT', 'BACnet'],
    },
    {
      title: 'Software Engineer — Full Stack',
      company: 'MyMicrojourney',
      location: 'San Diego, CA',
      period: 'Mar 2025 – Sep 2025',
      description: 'Built backend services with TypeScript, NestJS and MongoDB to support frontend application workflows, including REST APIs, request validation and persistence, protected route prefixes, and CORS configuration.',
      tags: ['TypeScript', 'NestJS', 'MongoDB', 'REST'],
    },
    {
      title: 'Full-Stack Developer Intern',
      company: 'Bad Kids Korporation',
      location: 'San Francisco, CA',
      period: 'Jul 2024 – Oct 2024',
      description: 'Led a cross-functional team building responsive web applications with HTML, CSS, and JavaScript, focusing on usability, debugging, and polished user experiences across devices.',
      tags: ['HTML', 'CSS', 'JavaScript', 'Team Lead'],
    },
  ];

  return (
    <>
      <Background />
      <Nav />
      <main className={styles.page}>
        <section id="home" className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow} data-reveal>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Available for new opportunities
            </p>
            <h1 className={styles.title} data-reveal style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
              Amdadul Haque
            </h1>
            <p className={styles.role} data-reveal style={{ '--reveal-delay': '160ms' } as React.CSSProperties}>
              <Typewriter phrases={roles} className={styles.roleText} cursorClassName={styles.cursor} />
            </p>
            <p className={styles.summary} data-reveal style={{ '--reveal-delay': '240ms' } as React.CSSProperties}>
              Software engineer with 2+ years of experience developing and delivering cross-platform applications,
              distributed backend systems, and full-stack websites using Go, Python, TypeScript, and React. I build
              event-driven architectures, secure backend services, real-time communication workflows, and responsive
              user interfaces.
            </p>
            <div className={styles.heroActions} data-reveal style={{ '--reveal-delay': '320ms' } as React.CSSProperties}>
              <a className={styles.primaryButton} href="#projects">
                View projects
                <span aria-hidden="true">→</span>
              </a>
              <a className={styles.secondaryButton} href={resume} target="_blank" rel="noopener noreferrer">
                Resume
                <span aria-hidden="true">↗</span>
              </a>
              <nav className={styles.socials} aria-label="Social and contact links">
                {Object.entries(allSocials).map(([id, social]) => (
                  <SocialDetail key={id} {...social} />
                ))}
              </nav>
            </div>
          </div>

          <div className={styles.heroVisual} data-reveal style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
            <div className={styles.orbit}>
              <span className={`${styles.ring} ${styles.ringOuter}`} aria-hidden="true" />
              <span className={`${styles.ring} ${styles.ringInner}`} aria-hidden="true" />
              <div className={styles.portraitFrame}>
                <img className={styles.portrait} src={profile} alt="Portrait of Amdadul Haque" />
              </div>
              {orbitChips.map((chip, index) => (
                <span
                  key={chip}
                  className={styles.orbitChip}
                  style={{ '--i': index, '--n': orbitChips.length } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </section>

        <ul className={styles.stats} aria-label="Highlights">
          {stats.map((stat, index) => (
            <li
              key={stat.label}
              className={`${styles.glassCard} ${styles.stat}`}
              data-reveal
              style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
            >
              <span className={styles.statValue}>
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>

        <div className={styles.expertiseCarousel} data-reveal>
          <div className={styles.expertiseTrack}>
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className={styles.expertiseList}
                aria-label={copy === 0 ? 'Areas of expertise' : undefined}
                aria-hidden={copy === 1 ? true : undefined}
              >
                {expertise.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ))}
          </div>
        </div>

        <section id="experience" className={styles.section}>
          <SectionHeading index="01">Experience</SectionHeading>
          <ol className={styles.timeline}>
            {allExperiences.map((experience, index) => (
              <ExperiencesDetail key={experience.company} experience={experience} delay={index * 120} />
            ))}
          </ol>
        </section>

        <section id="projects" className={styles.section}>
          <SectionHeading index="02">Projects</SectionHeading>
          <div className={styles.allProjects}>
            {Object.entries(allProjects).map(([id, item], index) => (
              <div key={id} data-reveal style={{ '--reveal-delay': `${index * 120}ms` } as React.CSSProperties}>
                <ProjectsDetail {...item} />
              </div>
            ))}
          </div>
        </section>

        <section id="resume" className={styles.section} aria-labelledby="resume-heading">
          <h1 id="resume-heading" className={styles.sectionTitle} data-reveal>
            <span className={styles.sectionIndex} aria-hidden="true">03</span>
            Resume
          </h1>
          <div className={styles.resumeWrap} data-reveal>
            <a
              ref={resumeTilt.ref}
              onMouseMove={resumeTilt.onMouseMove}
              onMouseLeave={resumeTilt.onMouseLeave}
              className={`${styles.glassCard} ${styles.tiltCard} ${styles.resumeCard}`}
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Amdadul Haque’s full resume (PDF, opens in a new tab)"
            >
              <div className={styles.resumePreviewWrap}>
                <img
                  className={styles.resumePreview}
                  src={resumePreview}
                  alt="Preview of the first page of Amdadul Haque’s resume"
                  loading="lazy"
                />
              </div>
              <div className={styles.resumeContent}>
                <p className={styles.resumeKicker}>PDF · 1 page</p>
                <h2 className={styles.projectTitle}>View full resume</h2>
                <p className={styles.projectDescription}>
                  Experience at LiNK, MyMicrojourney and Bad Kids Korporation, selected projects, and a B.S. in
                  Math-Computer Science from UC San Diego.
                </p>
                <span className={styles.resumeCta}>
                  Open in a new tab <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>
          </div>
        </section>

      </main>
      <ContactWidget />
    </>
  );
}
