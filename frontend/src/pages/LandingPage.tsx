import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { appointmentPath } from '../routes/appointmentPath'
import { homePath } from './auth/LoginPage'

export function LandingPage() {
  const { user } = useAuth()
  const accountPath = user && user.role !== 'GUEST' ? homePath(user.role) : '/login'
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div>
          <p className="landing-eyebrow">A little care. A better drive.</p>
          <h1 id="landing-title">
            AutoCare <span>Manager</span>
          </h1>
          <p className="landing-lead">
            Car care made simple, from your first appointment to the drive home.
          </p>
          <Link to={appointmentPath(user?.role)} className="landing-primary">
            Book an appointment <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="landing-illustration" aria-hidden="true">
          <svg viewBox="0 0 420 240" fill="none">
            <circle cx="218" cy="115" r="100" fill="#dbeafe" />
            <path d="M44 195h334" stroke="#bdd1e8" strokeWidth="3" strokeLinecap="round" />
            <path
              d="m76 145 30-58a19 19 0 0 1 17-11h132a23 23 0 0 1 20 12l33 57 33 13v29H62v-29l14-13Z"
              fill="white"
              stroke="#193858"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path d="m118 94-22 48h183l-28-48H118Z" fill="#c9def8" />
            <path d="M187 94v48" stroke="white" strokeWidth="6" />
            <path d="M76 160h34m178 0h35" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
            <circle cx="118" cy="185" r="23" fill="#193858" />
            <circle cx="118" cy="185" r="10" fill="#e4eefb" />
            <circle cx="288" cy="185" r="23" fill="#193858" />
            <circle cx="288" cy="185" r="10" fill="#e4eefb" />
            <rect x="295" y="28" width="65" height="65" rx="20" fill="#2563eb" />
            <path
              d="m310 59 12 12 23-25"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>Book. Service. Back on the road.</p>
        </div>
      </section>
      <section id="our-services" className="landing-about" aria-labelledby="about-title">
        <div>
          <p className="landing-eyebrow">Your car, in good hands</p>
          <h2 id="about-title">
            Practical care for
            <br />
            everyday journeys.
          </h2>
        </div>
        <div>
          <p>
            At AutoCare, we help keep your vehicle running with routine maintenance, inspections,
            and repairs. Tell us what your car needs, request a convenient appointment, and let our
            workshop take care of the next steps.
          </p>
          <ul className="landing-services">
            <li>Routine servicing & oil changes</li>
            <li>Vehicle inspections & diagnostics</li>
            <li>Brake & general repairs</li>
            <li>Service records & itemized billing</li>
          </ul>
        </div>
      </section>
      <section className="landing-actions" aria-labelledby="actions-title">
        <div className="landing-section-heading">
          <h2 id="actions-title">How can we help?</h2>
          <p>Choose where you would like to start.</p>
        </div>
        <div className="landing-tiles">
          <Link className="landing-tile landing-tile-featured" to={appointmentPath(user?.role)}>
            <span className="landing-tile-number" aria-hidden="true">
              01 / BOOK
            </span>
            <h3>Appointment</h3>
            <p>
              Plan your next service. Log in to use your account, or continue as a guest with your
              phone number.
            </p>
            <span className="landing-tile-link">
              Book a visit <span aria-hidden="true">→</span>
            </span>
          </Link>
          <a className="landing-tile" href="#our-services">
            <span className="landing-tile-number" aria-hidden="true">
              02 / EXPLORE
            </span>
            <h3>Our services</h3>
            <p>
              From regular maintenance to a specific issue, find out how we can help care for your
              car.
            </p>
            <span className="landing-tile-link">
              Explore services <span aria-hidden="true">→</span>
            </span>
          </a>
          <Link className="landing-tile" to={accountPath}>
            <span className="landing-tile-number" aria-hidden="true">
              03 / MANAGE
            </span>
            <h3>My AutoCare</h3>
            <p>
              Access your profile, appointments, and vehicle information in one convenient place.
            </p>
            <span className="landing-tile-link">
              {user && user.role !== 'GUEST' ? 'Open dashboard' : 'Access your account'}{' '}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </section>
      <footer className="landing-footer">
        <strong>AutoCare Manager</strong>
        <span>Keeping car care simple.</span>
      </footer>
    </main>
  )
}
