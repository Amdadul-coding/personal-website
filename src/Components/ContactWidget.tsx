import { useEffect, useRef, useState } from 'react';
import styles from '../styles/contact.module.css';

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (isOpen) nameRef.current?.focus();
    else if (restoreFocusRef.current) {
      buttonRef.current?.focus();
      restoreFocusRef.current = false;
    }
  }, [isOpen]);

  function closePanel() {
    restoreFocusRef.current = true;
    setIsOpen(false);
  }

  return (
    <div
      className={styles.widget}
      onKeyDown={(event) => {
        if (isOpen && event.key === 'Escape') {
          event.preventDefault();
          closePanel();
        }
      }}
    >
      {isOpen && (
        <section
          id="contact-panel"
          className={styles.panel}
          role="dialog"
          aria-labelledby="contact-heading"
        >
          <div className={styles.heading}>
            <h2 id="contact-heading">Contact me</h2>
            <button className={styles.close} type="button" onClick={closePanel} aria-label="Close contact form">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <form
            className={styles.form}
            noValidate
            onSubmit={(event) => {
              // Frontend only: keep the draft without sending or validating it.
              event.preventDefault();
            }}
          >
            <label htmlFor="contact-name">Your name</label>
            <input
              ref={nameRef}
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <label htmlFor="contact-email">Your email</label>
            <input
              id="contact-email"
              name="email"
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              placeholder="Write your message…"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button className={styles.send} type="submit">Send</button>
          </form>
        </section>
      )}
      {!isOpen && <button
        ref={buttonRef}
        className={styles.trigger}
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'contact-panel' : undefined}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        Contact me
      </button>}
    </div>
  );
}
