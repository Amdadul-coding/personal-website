import styles from '../styles/home.module.css';
import profile from '../assets/profile.jpg';

const expertise = [
  'Distributed Systems',
  'Real-Time & Event-Driven Systems',
  'Debugging',
  'Cross-platform development',
  'Full-stack App/Web Development',
];

export default function Home() {
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
        <h1 className={styles.experienceTitle}>
          My Experience
        </h1>
        <div>

        </div>
      </section>
    </>
  );
}
