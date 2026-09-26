import styles from '../styles/home.module.css';
import profile from '../assets/profile.jpg';
import githubLogo from '../assets/github.png';
import linkedinLogo from '../assets/linkedin.png';
import emailLogo from '../assets/email.png';
import projectBrightness from '../assets/brightnessController.jpg'
import projectFitness from '../assets/everything-fitness-preview.png';
import resume from '../assets/resume.pdf';
import resumePreview from '../assets/resume-preview.png';
import ContactWidget from '../Components/ContactWidget';

const expertise = [
  'Distributed Systems',
  'Real-Time & Event-Driven Systems',
  'Debugging',
  'Cross-platform development',
  'Full-stack App/Web Development',
];

type ExperienceProps = {
  title: string;
  description: string;
}

type SocialProps = {
  name: string;
  link: string;
  logo: string;
  placeholder: string;
}

type ProjectProps = {
  previewImage: string;
  link: string;
  openInNewTab?: boolean;
  title: string;
  description: string;
  stack: string[];
}

function SocialDetail({ name, link, logo, placeholder }: SocialProps) {
  const isEmail = link.startsWith('mailto:');

  return (
    <a
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
  return (
    <a
      className={styles.projectCard}
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
        <ul className={styles.projectStack} aria-label="Technology stack">
          {projectProps.stack.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </div>
    </a>
  );
}

function ExperiencesDetail (experienceProps:ExperienceProps) {
  return(
    <div className={styles.experienceDetails}>
      <h2 className={styles.experienceTitle}>
        {experienceProps.title}
      </h2>
      <p className={styles.experienceDescription}>
        {experienceProps.description}
      </p>
    </div>
  );
}

export default function Home() {

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
      title: 'Brightness Controller',
      description: 'Built an app for controlling external monitor brightness to automate daily brightness schedules, this saves me from fiddling with monitor buttons and making brigntess adjustments easier',
      stack: ['React', 'TypeScript', 'Python'],
    },
  };

  const allExperiences: Record<string, ExperienceProps> ={
    'exp1': {
      title: 'Software Engineer @ Link',
      description: 'Build and ship full-stack software across distributed backend systems, real-time applications, and production integrations. Expertise spans Go services, React and TypeScript interfaces, Python-based BACnet automation, JWT authentication, NATS messaging, observability, and customer-facing web platforms. Specialize in building reliable systems that connect applications, backend services, and external devices while improving security, debugging, and real-time user experiences.'
    },
    'exp2': {
      title: 'Full-Stack Engineer @ MyMicrojourney',
      description: 'Built backend services with NestJS and MongoDB to support frontend application workflows, including REST APIs, data validation and persistence, secure routing, and CORS configuration.'
    },
    'exp3': {
      title: 'Full-Stack Developer @Bad Kids Korporation',
      description: 'Led a cross-functional team building responsive web applications with HTML, CSS, and JavaScript, focusing on usability, debugging, and polished user experiences across devices.'
    }
  }
  
  return(
    <>
      <section className={styles.introduction}>
        <div className={styles.profileColumn}>
          <img className={styles.portrait} src={profile} alt="myPortrait" />
          <nav className={styles.socials} aria-label="Social and contact links">
            {Object.entries(allSocials).map(([id, social]) => (
              <SocialDetail key={id} {...social} />
            ))}
          </nav>
        </div>
        <div className={styles.aboutMe}>
          <h1
            className={styles.title}
            tabIndex={0}
            aria-label="Amdadul Haque — Software Engineer"
          >
            <span className={styles.titleFlip} aria-hidden="true">
              <span className={styles.titleFront}>Amdadul Haque</span>
              <span className={styles.titleBack}>Software Engineer</span>
            </span>
          </h1>
          <p className={styles.summary}>
            Software engineer with 2+ years of experience developing and delivering cross-platform applications, distributed backend systems, and
            full-stack websites using languages and tools such as Go, Python, TypeScript, CSS, and React. Experience encompasses event-driven architectures,
            secure backend services, real-time communication workflows, and responsive user interfaces.
          </p>
          <div className={styles.expertiseCarousel}>
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
        </div>
      </section>
      <section className={styles.experience}>
        <h1>
          Experiences
        </h1>
        <div className={styles.allExperiences}>
        {[allExperiences.exp1, allExperiences.exp2, allExperiences.exp3].map((item)=>{
          return(
            <ExperiencesDetail title={item.title} description={item.description}/>
          );
        })
        }
        </div>
      </section>
      <section className={styles.projects}>
        <h1>
          Projects
        </h1>
        <div className={styles.allProjects}>
          {Object.entries(allProjects).map(([id, item]) => (
            <ProjectsDetail
              key={id}
              previewImage={item.previewImage}
              link={item.link}
              openInNewTab={item.openInNewTab}
              title={item.title}
              description={item.description}
              stack={item.stack}
            />
          ))}
        </div>
      </section>
      <section className={styles.resume} aria-labelledby="resume-heading">
        <h1 id="resume-heading">Resume</h1>
        <a
          className={`${styles.projectCard} ${styles.resumeCard}`}
          href={resume}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Amdadul Haque’s full resume (PDF, opens in a new tab)"
        >
          <img
            className={styles.resumePreview}
            src={resumePreview}
            alt="Preview of the first page of Amdadul Haque’s resume"
            loading="lazy"
          />
          <div className={styles.projectContent}>
            <div className={styles.projectHeading}>
              <h2 className={styles.projectTitle}>View full resume</h2>
              <span className={styles.projectArrow} aria-hidden="true">↗</span>
            </div>
            <p className={styles.projectDescription}>PDF · Opens in a new tab</p>
          </div>
        </a>
      </section>
      <ContactWidget />
    </>
  );
}
