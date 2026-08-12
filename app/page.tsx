import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Zap, Users, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'TalentFlow — AI Recruitment OS',
  description: 'AI-powered applicant tracking system with explainable candidate matching, automated assessments, and collaborative hiring.',
  openGraph: {
    title: 'TalentFlow — AI Recruitment OS',
    description: 'Hire faster and smarter with AI-powered candidate matching.',
    url: 'https://talentflow.com',
    siteName: 'TalentFlow',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <main className="landing-page dark-mode-support">
      {/* Navigation */}
      <nav className="topbar sticky-nav">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <span>talentflow</span>
        </div>
        <div className="nav-links desktop-only">
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <Link href="/login">
            <button className="secondary-button">Sign In</button>
          </Link>
          <Link href="/login">
            <button className="primary-button">Try Demo <ArrowRight size={16} /></button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section text-center padded-section">
        <div className="hero-content">
          <p className="eyebrow violet-text">THE MODERN ATS</p>
          <h1 className="hero-title">Hire faster with <br />AI-powered insights <span className="magic-sparkle">✦</span></h1>
          <p className="hero-subtitle">
            TalentFlow streamlines your hiring process from sourcing to offer. Get structured scorecards, automated resume parsing, and objective candidate matching.
          </p>
          <div className="hero-actions center-actions">
            <Link href="/login">
              <button className="primary-button large pulse-effect">Get Started for Free <ArrowRight size={18} /></button>
            </Link>
            <Link href="#contact">
              <button className="secondary-button large">Contact Sales</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-grid padded-section bg-alt">
        <div className="section-header text-center">
          <h2 className="section-title">Everything you need to scale your team</h2>
          <p className="section-desc">A unified platform for modern talent acquisition.</p>
        </div>
        <div className="grid-3">
          <article className="feature-card glass-panel">
            <div className="feature-icon violet"><Zap size={24} /></div>
            <h3>AI Resume Parsing</h3>
            <p>Extract structured skills, experience, and education instantly with high-accuracy language models.</p>
          </article>
          <article className="feature-card glass-panel">
            <div className="feature-icon blue"><ShieldCheck size={24} /></div>
            <h3>Unbiased Matching</h3>
            <p>Match candidates objectively against job requirements to reduce human bias and improve quality of hire.</p>
          </article>
          <article className="feature-card glass-panel">
            <div className="feature-icon teal"><Users size={24} /></div>
            <h3>Structured Interviews</h3>
            <p>Standardize feedback with unified scorecards. Align your team on every hiring decision.</p>
          </article>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="padded-section">
        <div className="section-header text-center">
          <h2 className="section-title">Loved by fast-growing teams</h2>
        </div>
        <div className="grid-2 testimonial-grid">
          <div className="testimonial-card">
            <p className="quote">"TalentFlow reduced our time-to-hire by 40%. The AI matching is incredibly accurate."</p>
            <div className="author">
              <strong>Sarah Jenkins</strong>
              <small>VP of Talent, TechCorp</small>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="quote">"Finally, an ATS that developers actually enjoy using for technical assessments."</p>
            <div className="author">
              <strong>David Chen</strong>
              <small>Engineering Manager, StartupX</small>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="padded-section bg-alt">
        <div className="section-header text-center">
          <h2 className="section-title">Simple, transparent pricing</h2>
        </div>
        <div className="grid-2 pricing-grid center-layout">
          <div className="pricing-card glass-panel">
            <h3>Starter</h3>
            <div className="price">$0<span>/mo</span></div>
            <p>Perfect for exploring the platform.</p>
            <ul className="feature-list">
              <li><CheckCircle size={16}/> Up to 3 active jobs</li>
              <li><CheckCircle size={16}/> Basic AI Parsing</li>
              <li><CheckCircle size={16}/> Community Support</li>
            </ul>
            <Link href="/login"><button className="secondary-button full-width">Start Free</button></Link>
          </div>
          <div className="pricing-card featured glass-panel border-violet">
            <div className="badge">Most Popular</div>
            <h3>Growth</h3>
            <div className="price">$299<span>/mo</span></div>
            <p>For teams scaling their hiring.</p>
            <ul className="feature-list">
              <li><CheckCircle size={16} color="#6756d9" /> Unlimited active jobs</li>
              <li><CheckCircle size={16} color="#6756d9" /> Advanced AI Matching</li>
              <li><CheckCircle size={16} color="#6756d9" /> Technical Assessments</li>
              <li><CheckCircle size={16} color="#6756d9" /> Priority Support</li>
            </ul>
            <Link href="/login"><button className="primary-button full-width">Upgrade to Growth</button></Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="padded-section">
        <div className="section-header text-center">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          <details className="faq-item">
            <summary>How does the AI matching work? <ChevronRight size={18} className="chevron" /></summary>
            <p>Our AI analyzes the semantic meaning of the job description and candidate resume to score alignment on skills, experience, and domain knowledge.</p>
          </details>
          <details className="faq-item">
            <summary>Is the coding assessment environment secure? <ChevronRight size={18} className="chevron" /></summary>
            <p>Yes, code execution happens in isolated, ephemeral environments ensuring complete security and fairness.</p>
          </details>
          <details className="faq-item">
            <summary>Can I integrate my existing calendar? <ChevronRight size={18} className="chevron" /></summary>
            <p>TalentFlow integrates with Google Workspace and Microsoft 365 to seamlessly schedule interviews.</p>
          </details>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="padded-section bg-alt text-center">
        <h2 className="section-title">Ready to transform your hiring?</h2>
        <p className="section-desc mb-20">Get in touch with our sales team for a custom demo.</p>
        <button className="primary-button large">Contact Us <HelpCircle size={18} /></button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="brand">
            <Sparkles size={18} className="violet-text" /> <span>talentflow</span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
        <p className="copyright">© 2026 TalentFlow. All rights reserved.</p>
      </footer>
    </main>
  )
}
