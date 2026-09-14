import styles from '../styles/home.module.css';
import profile from '../assets/profile.jpg';
import projectBrightness from '../assets/brightnessController.jpg'

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

type ProjectProps = {
  previewImage: string;
  link: string;
  title: string;
  description: string;
  stack: string[];
}

function ProjectsDetail(projectProps: ProjectProps) {
  return (
    <a className={styles.projectCard} href={projectProps.link || undefined}>
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

const allProjects: Record<string, ProjectProps> = {
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
    description: 'I build and ship full-stack software across distributed backend systems, real-time applications, and production integrations. My work spans Go services, React and TypeScript interfaces, Python-based BACnet automation, JWT authentication, NATS messaging, observability, and customer-facing web platforms. I focus on building reliable systems that connect applications, backend services, and external devices while improving security, debugging, and real-time user experiences.'
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
        <img src={profile} alt="myPortrait" />
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
            I am a software engineer with 2+ years of experience developing and delivering cross-platform applications, distributed backend systems, and
            full stack website using languages/tools such as Go, Python, Typescript, and React. My experience includes designing event-driven integrations,
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
              title={item.title}
              description={item.description}
              stack={item.stack}
            />
          ))}
        </div>
      </section>
    </>
  );
}
