import styles from '../styles/home.module.css';
import profile from '../assets/profile.jpg';

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

const allExperiences: Record<string, ExperienceProps> ={
  
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
          <h1 className={styles.title}>
            Amdadul Haque
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
        <div>

        </div>
      </section>
    </>
  );
}
