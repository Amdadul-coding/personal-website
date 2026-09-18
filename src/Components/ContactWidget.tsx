import { useEffect, useRef, useState } from 'react';
import styles from '../styles/contact.module.css';

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const [successExiting, setSuccessExiting] = useState(false);
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

  useEffect(() => {
    if (!sent) return;
    const fade = window.setTimeout(() => setSuccessExiting(true), 5000);
    const dismiss = window.setTimeout(() => {
      setFeedback('');
      setSent(false);
      setSuccessExiting(false);
    }, 5240);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(dismiss);
    };
  }, [sent]);

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
            onSubmit={async (event) => {
              event.preventDefault();
              if (submittingRef.current || sent) return;
              submittingRef.current = true;
              setIsSubmitting(true);
              setErrors({});
              setFeedback('');
              setFailed(false);
              setSent(false);
              setSuccessExiting(false);
              try {
                const response = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, email, message }),
                  signal: AbortSignal.timeout(15000),
                });
                const result = await response.json();
                setFailed(!response.ok);
                setErrors(result.errors ?? {});
                setFeedback(response.ok || Object.keys(result.errors ?? {}).length > 0
                  ? ''
                  : result.message ?? 'Unable to submit the form. Please try again.');
                if (response.ok) {
                  setSent(true);
                  setName('');
                  setEmail('');
                  setMessage('');
                }
              } catch {
                setFailed(true);
                setFeedback('Unable to reach the contact server. Please try again later.');
              } finally {
                submittingRef.current = false;
                setIsSubmitting(false);
              }
            }}
            aria-busy={isSubmitting}
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
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && <p id="contact-name-error" className={styles.error}>{errors.name}</p>}
            <label htmlFor="contact-email">Your email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email && <p id="contact-email-error" className={styles.error}>{errors.email}</p>}
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              placeholder="Write your message…"
              value={message}
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              onChange={(event) => setMessage(event.target.value)}
            />
            {errors.message && <p id="contact-message-error" className={styles.error}>{errors.message}</p>}
            {failed && feedback && <p
              className={styles.error}
              role="alert"
            >{feedback}</p>}
            <button className={styles.send} type="submit" disabled={isSubmitting || sent}
              data-sent={sent && !successExiting}>
              <span key={isSubmitting ? 'submitting' : sent ? 'sent' : 'send'}
                className={successExiting ? styles.successExit : styles.buttonLabel}>
                {isSubmitting ? 'Submitting…' : sent ? 'Sent' : 'Send'}
              </span>
            </button>
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
