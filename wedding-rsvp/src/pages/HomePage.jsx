import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import arrowDesign from '../assets/designs/arrow.png';
import dresscodeDesign from '../assets/designs/dresscode.svg';
import hotelDesign from '../assets/designs/hotel.svg';
import LandingCarousel from '../components/LandingCarousel';
import inviteCardDesign from '../assets/designs/invite_card.svg';
import planeDesign from '../assets/designs/plane.svg';
import rsvpPageDesign from '../assets/designs/rsvp-page.svg';
import timelineDesign from '../assets/designs/timeline-2.svg';

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('homepage-snap');
    document.body.classList.add('homepage-snap');

    return () => {
      document.documentElement.classList.remove('homepage-snap');
      document.body.classList.remove('homepage-snap');
    };
  }, []);

  const rsvpPath = location.pathname.startsWith('/invite') ? '/invite/rsvp' : '/rsvp';
  const rsvpHref = `${rsvpPath}${location.search}`;

  return (
    <div className="page landing-page">
      <section className="landing-hero" aria-label="Wedding invitation hero">
        <div className="landing-card-wrap">
          <img
            className="landing-invite-card"
            src={inviteCardDesign}
            alt="Wedding invitation for Alyza and Mark"
          />
        </div>

        <div className="landing-scroll-cue" aria-hidden="true">
          <div className="landing-scroll-inner">
            <p className="landing-scroll-copy">
              <span>Scroll to</span>
              <span>rsvp &amp; more</span>
            </p>
            <img className="landing-scroll-arrow" src={arrowDesign} alt="" />
          </div>
        </div>
      </section>

      <LandingCarousel />

      <section className="landing-third-panel" aria-label="Wedding timeline section">
        <h2 className="landing-timeline-title">
          <span className="landing-timeline-line landing-timeline-line-top">Order of</span>
          <span className="landing-timeline-line landing-timeline-line-bottom">The Day</span>
        </h2>

        <div className="landing-timeline-art">
          <img
            className="landing-timeline-artwork"
            src={timelineDesign}
            alt="Wedding timeline details"
          />
        </div>
      </section>

      <section className="landing-fourth-panel" aria-label="Travel information section">
        <h2 className="landing-travel-title">
          <span className="landing-travel-line">getting here...</span>
        </h2>

        <div className="landing-travel-copy">
          <section className="landing-travel-stop">
            <h3 className="landing-travel-stop-title">The Venue</h3>
            <p className="landing-travel-stop-body">
              Our venue is the fabulous{' '}
              <a
                className="landing-travel-link"
                href="https://www.mountstuart.com/"
                target="_blank"
                rel="noreferrer"
              >
                Mount Stuart
              </a>{' '}
              on the Isle of Bute, Scotland. To reach us, you will need to take the
              ferry from Wemyss Bay to Rothesay. The ferry takes both cars and
              pedestrians, and takes about 35 minutes.
            </p>
          </section>

          <section className="landing-travel-stop">
            <h3 className="landing-travel-stop-title">Wemyss Bay</h3>
            <p className="landing-travel-stop-body">
              <a
                className="landing-travel-link"
                href="https://maps.app.goo.gl/N1qCWeZzyuKYjGjv8"
                target="_blank"
                rel="noreferrer"
              >
                Wemyss Bay
              </a>{' '}
              is approximately 45 minutes from Glasgow by car. By train, direct
              services run from Glasgow Central straight to{' '}
              <a
                className="landing-travel-link"
                href="https://maps.app.goo.gl/N1qCWeZzyuKYjGjv8"
                target="_blank"
                rel="noreferrer"
              >
                Wemyss Bay station
              </a>
              , which is directly connected to the ferry terminal.
            </p>
          </section>

          <section className="landing-travel-stop">
            <h3 className="landing-travel-stop-title">The Ferry</h3>
            <p className="landing-travel-stop-body">
              Please book your crossing in advance via the{' '}
              <a
                className="landing-travel-link"
                href="https://ticketing.calmac.co.uk/B2C-Calmac/#/auth/welcoming"
                target="_blank"
                rel="noreferrer"
              >
                CalMac website
              </a>{' '}
              - summer sailings fill quickly. See below for timetables and tickets.
            </p>
          </section>

          <section className="landing-travel-stop">
            <h3 className="landing-travel-stop-title">Rothesay to Mount Stuart</h3>
            <p className="landing-travel-stop-body">
              Mount Stuart is 5 miles south of Rothesay. Taxis are available but we
              recommend{' '}
              <a
                className="landing-travel-link"
                href="https://www.thomsonlocal.com/search/taxis/isle-of-bute"
                target="_blank"
                rel="noreferrer"
              >
                pre-booking
              </a>
              .
            </p>
          </section>
        </div>
      </section>

      <section className="landing-fifth-panel" aria-label="International guests information section">
        <img className="landing-international-plane" src={planeDesign} alt="" aria-hidden="true" />
        <h2 className="landing-international-title">
          <span className="landing-international-line landing-international-line-top">
            for international
          </span>
          <span className="landing-international-line landing-international-line-bottom">
            guests
          </span>
        </h2>

        <div className="landing-international-card">
          <span className="landing-international-corner landing-international-corner-tl" aria-hidden="true" />
          <span className="landing-international-corner landing-international-corner-br" aria-hidden="true" />

          <p className="landing-international-intro">The three nearest airports to Bute are:</p>

          <div className="landing-international-airports">
            <section className="landing-international-airport">
              <h3 className="landing-international-airport-name">Glasgow International (GLA)</h3>
              <p className="landing-international-airport-body">
                ~45 mins to Wemyss Bay by car. Car hire available; taxis also run directly to the
                ferry terminal.
              </p>
            </section>

            <section className="landing-international-airport">
              <h3 className="landing-international-airport-name">Glasgow Prestwick (PIK)</h3>
              <p className="landing-international-airport-body">
                ~40 mins to Wemyss Bay by car. By train: Prestwick Town - Glasgow Central - Wemyss
                Bay.
              </p>
            </section>

            <section className="landing-international-airport">
              <h3 className="landing-international-airport-name">Edinburgh Airport (EDI)</h3>
              <p className="landing-international-airport-body">
                ~1.5 hrs to Wemyss Bay by car. By train: tram to Edinburgh Waverley - Glasgow
                Central - Wemyss Bay.
              </p>
            </section>
          </div>
        </div>
      </section>

      <section className="landing-sixth-panel" aria-label="Accommodation section">
        <img
          className="landing-accommodation-artwork"
          src={hotelDesign}
          alt="Hotel illustration"
        />

        <h2 className="landing-accommodation-title">accommodation</h2>

        <div className="landing-accommodation-card">
          <span className="landing-accommodation-corner landing-accommodation-corner-tl" aria-hidden="true" />
          <span className="landing-accommodation-corner landing-accommodation-corner-tr" aria-hidden="true" />
          <span className="landing-accommodation-corner landing-accommodation-corner-bl" aria-hidden="true" />
          <span className="landing-accommodation-corner landing-accommodation-corner-br" aria-hidden="true" />

          <p className="landing-accommodation-intro">
            There are several hotels and guest houses located on the island.
          </p>
          <p className="landing-accommodation-intro">
            We recommend booking your accommodation as early as possible – Bute is a beautiful but
            small island and spaces fill quickly!
          </p>

          <div className="landing-accommodation-groups">
            <section className="landing-accommodation-group">
              <h3 className="landing-accommodation-group-name">Hotels</h3>
              <p className="landing-accommodation-place">Glenburn Hotel</p>
              <p className="landing-accommodation-place">Kingarth Hotel</p>
            </section>

            <section className="landing-accommodation-group">
              <h3 className="landing-accommodation-group-name">Bed &amp; Breakfast</h3>
              <p className="landing-accommodation-place">The Ardyne Guest House</p>
              <p className="landing-accommodation-place">Glendale Guest House</p>
              <p className="landing-accommodation-place">The Boat House</p>
              <p className="landing-accommodation-place">Highlander House</p>
            </section>

            <section className="landing-accommodation-group">
              <h3 className="landing-accommodation-group-name">Self-Catering &amp; Apartments</h3>
              <p className="landing-accommodation-place">Lexington Apartments</p>
              <p className="landing-accommodation-place">Kames Castle Cottages</p>
              <p className="landing-accommodation-place">The Coach House at Stewart Hall</p>
              <p className="landing-accommodation-place">Kildavannan Schoolhouse</p>
            </section>
          </div>
        </div>
      </section>

      <section className="landing-seventh-panel" aria-label="Dress code section">
        <div className="landing-dresscode-content">
          <img
            className="landing-dresscode-artwork"
            src={dresscodeDesign}
            alt="Dress code illustration of heels and formal shoes"
          />

          <h2 className="landing-dresscode-title">dresscode</h2>

          <p className="landing-dresscode-body">We would love for our guests to dress to impress!</p>

          <p className="landing-dresscode-emphasis">Formal attire</p>

          <p className="landing-dresscode-body">
            We kindly ask that guests avoid wearing burgundy or deep red tones, as these are
            reserved for our bridal party.
          </p>

          <div className="landing-dresscode-swatches" aria-hidden="true">
            <span className="landing-dresscode-swatch landing-dresscode-swatch-deep" />
            <span className="landing-dresscode-swatch landing-dresscode-swatch-rich" />
            <span className="landing-dresscode-swatch landing-dresscode-swatch-bright" />
            <span className="landing-dresscode-swatch landing-dresscode-swatch-muted" />
          </div>

          <p className="landing-dresscode-body landing-dresscode-body-last">
            Filipiniana, Barong and Kilts are also warmly welcomed
          </p>
        </div>
      </section>

      <section className="landing-eighth-panel" aria-label="Useful things to know section">
        <h2 className="landing-centered-title">
          <span className="landing-centered-title-line">useful things</span>
          <span className="landing-centered-title-line landing-centered-title-line-bottom">
            to know
          </span>
        </h2>
      </section>

      <section className="landing-accent-panel" aria-label="RSVP reminder section">
        <img className="landing-accent-artwork" src={rsvpPageDesign} alt="RSVP reminder details" />

        <div className="landing-accent-content">
          <p className="landing-accent-copy">
            <span>26 June 2027</span>
            <span>Mount Stuart</span>
            <span>Isle of Bute</span>
          </p>

          <Link className="landing-accent-button" to={rsvpHref}>
            <span className="landing-accent-button-label">rsvp</span>
          </Link>

          <p className="landing-accent-deadline">rsvp by 31 Aug 2026</p>
        </div>
      </section>
    </div>
  );
}