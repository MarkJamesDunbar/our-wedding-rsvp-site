import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import arrowDesign from '../assets/designs/arrow.png';
import dresscodeDesign from '../assets/designs/dresscode.webp';
import hotelDesign from '../assets/designs/hotel.svg';
import LandingCarousel from '../components/LandingCarousel';
import inviteCardDesign from '../assets/designs/invite_card.webp';
import lightbulbDesign from '../assets/designs/lightbulb.svg';
import planeDesign from '../assets/designs/plane.svg';
import rsvpPageDesign from '../assets/designs/rsvp-page.webp';
import timelineDesign from '../assets/designs/timeline-2.svg';

export default function HomePage() {
  const location = useLocation();
  const renderGap = (key) => <div key={key} className="landing-page-gap" aria-hidden="true" />;

  useEffect(() => {
    // iOS Safari paints the notch/home-indicator zones with the BODY
    // background colour (theme-color for the top zone on iOS 15+) while its
    // toolbar is expanded; once the toolbar collapses, actual page content
    // extends under the insets. Sync the colour to the most-visible panel so
    // the pre-collapse state matches each page. Panels without a
    // data-inset-color are cream.
    const DEFAULT_INSET_COLOR = '#f7ebdb';
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    const applyColor = (color) => {
      document.body.style.backgroundColor = color;
      themeMeta?.setAttribute('content', color);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            applyColor(entry.target.dataset.insetColor || DEFAULT_INSET_COLOR);
          }
        }
      },
      { threshold: 0.55 }
    );

    document
      .querySelectorAll('.landing-page > section[data-inset-color], .landing-page > section:not([data-inset-color])')
      .forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      document.body.style.backgroundColor = '';
      themeMeta?.setAttribute('content', DEFAULT_INSET_COLOR);
    };
  }, []);

  const rsvpPath = location.pathname.startsWith('/invite') ? '/invite/rsvp' : '/rsvp';
  const rsvpHref = `${rsvpPath}${location.search}`;

  return (
    <div className="page landing-page">
      <section
        className="landing-hero"
        aria-label="Wedding invitation hero"
        data-inset-color="#bababa"
      >
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

      {renderGap('gap-hero-carousel')}

      <LandingCarousel />

      {renderGap('gap-carousel-timeline')}

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
            loading="lazy"
          />
        </div>
      </section>

      {renderGap('gap-timeline-travel')}

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
              ferry from Wemyss Bay to Rothesay.
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
              </a>{' '}
              (connected to the ferry terminal).
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
              - summer sailings fill quickly.
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

      {renderGap('gap-travel-international')}

      <section
        className="landing-fifth-panel"
        aria-label="International guests information section"
        data-inset-color="#becbbb"
      >
        <img className="landing-international-plane" src={planeDesign} alt="" aria-hidden="true" loading="lazy" />
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

          {/* <p className="landing-international-intro">Bute has 3 nearby airports:</p> */}

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

      {renderGap('gap-international-accommodation')}

      <section
        className="landing-sixth-panel"
        aria-label="Accommodation section"
        data-inset-color="#c6cfcb"
      >
        <img
          className="landing-accommodation-artwork"
          src={hotelDesign}
          alt="Hotel illustration"
          loading="lazy"
        />

        <h2 className="landing-accommodation-title">accommodation</h2>

        <div className="landing-accommodation-card">
          <span className="landing-accommodation-corner landing-accommodation-corner-tl" aria-hidden="true" />
          <span className="landing-accommodation-corner landing-accommodation-corner-br" aria-hidden="true" />

          {/* <p className="landing-accommodation-intro">
            There are multiple hotels and guest houses on the Isle of Bute.
          </p> */}
          <div className="landing-accommodation-groups">
            <section className="landing-accommodation-group">
              <h3 className="landing-accommodation-group-name">Hotels</h3>
              <a
                className="landing-accommodation-place"
                href="https://bespokehotels.com/glenburn-hotel/contact-us/"
                target="_blank"
                rel="noreferrer"
              >
                Glenburn Hotel
              </a>
              <a
                className="landing-accommodation-place"
                href="https://www.kingarth-bute.co.uk/"
                target="_blank"
                rel="noreferrer"
              >
                Kingarth Hotel
              </a>
            </section>

            <section className="landing-accommodation-group">
              <h3 className="landing-accommodation-group-name">Bed &amp; Breakfast</h3>
              <a
                className="landing-accommodation-place"
                href="https://www.theardyneguesthouse.co.uk/"
                target="_blank"
                rel="noreferrer"
              >
                The Ardyne Guest House
              </a>
              <a
                className="landing-accommodation-place"
                href="https://www.tripadvisor.co.uk/Hotel_Review-g551924-d660426-Reviews-Glendale_Guest_House-Rothesay_Isle_of_Bute_Argyll_and_Bute_Scotland.html"
                target="_blank"
                rel="noreferrer"
              >
                Glendale Guest House
              </a>
              <a
                className="landing-accommodation-place"
                href="https://www.theboathouse-bute.co.uk/"
                target="_blank"
                rel="noreferrer"
              >
                The Boat House
              </a>
              <a
                className="landing-accommodation-place"
                href="https://highlanderhouse.co.uk/"
                target="_blank"
                rel="noreferrer"
              >
                Highlander House
              </a>
            </section>

            <section className="landing-accommodation-group">
              <h3 className="landing-accommodation-group-name">Self-Catering &amp; Apartments</h3>
              <a
                className="landing-accommodation-place"
                href="https://www.lexingtonapartmentsbute.co.uk/"
                target="_blank"
                rel="noreferrer"
              >
                Lexington Apartments
              </a>
              <a
                className="landing-accommodation-place"
                href="https://www.kamescastlecottages.co.uk/"
                target="_blank"
                rel="noreferrer"
              >
                Kames Castle Cottages
              </a>
              <a
                className="landing-accommodation-place"
                href="https://www.airbnb.co.uk/rooms/622889571391384500?source_impression_id=p3_1782344120_P3RbiYclIUu_obee"
                target="_blank"
                rel="noreferrer"
              >
                The Coach House at Stewart Hall
              </a>
              <a
                className="landing-accommodation-place"
                href="https://www.airbnb.co.uk/rooms/17433211?_set_bev_on_new_domain=1782344180_EANjE2OGU1ZTE0NT&set_everest_cookie_on_new_domain=1782344180.EAZDM2NDRmZGEyYmVmOG.uHyJ3mA0FuZ5q2YLbMltJb14Llwd-X-EfgUhsFYOSkI&source_impression_id=p3_1782344181_P3zEe8h6f6XQ6mcZ"
                target="_blank"
                rel="noreferrer"
              >
                Kildavannan Schoolhouse
              </a>
            </section>
          </div>
        </div>
      </section>

      {renderGap('gap-accommodation-dresscode')}

      <section className="landing-seventh-panel" aria-label="Dress code section">
        <div className="landing-dresscode-content">
          <img
            className="landing-dresscode-artwork"
            src={dresscodeDesign}
            alt="Dress code illustration of heels and formal shoes"
            loading="lazy"
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

      {renderGap('gap-dresscode-useful')}

      <section className="landing-eighth-panel" aria-label="Useful things to know section">
        <img
          className="landing-useful-artwork"
          src={lightbulbDesign}
          alt="Lightbulb illustration"
          loading="lazy"
        />

        <h2 className="landing-centered-title">
          <span className="landing-centered-title-line">useful things</span>
          <span className="landing-centered-title-line landing-centered-title-line-bottom">
            to know
          </span>
        </h2>

        <div className="landing-useful-copy">
          <section className="landing-useful-stop">
            <h3 className="landing-useful-stop-title">Cash</h3>
            <p className="landing-useful-stop-body">
              We recommend arriving with some cash as card coverage can be limited in more rural
              parts of the island.
            </p>
          </section>

          <section className="landing-useful-stop">
            <h3 className="landing-useful-stop-title">Mobile signal</h3>
            <p className="landing-useful-stop-body">
              Signal on the Isle of Bute can be patchy in places, particularly outside Rothesay.
              We recommend downloading any maps, ferry tickets, or accommodation confirmations to
              your phone before you travel!
            </p>
          </section>

          <section className="landing-useful-stop">
            <h3 className="landing-useful-stop-title">Stocking up</h3>
            <p className="landing-useful-stop-body">
              Rothesay is Bute's main town and has everyday essentials including a pharmacy,
              supermarket, and cash machines. For larger shops or shopping centres, we recommend
              picking these up on the mainland before taking the ferry.
            </p>
          </section>

          <section className="landing-useful-stop">
            <h3 className="landing-useful-stop-title">The weather</h3>
            <p className="landing-useful-stop-body">
              Scotland in June can be glorious – but do pack a layer and a compact umbrella just in
              case. We'll be keeping our fingers crossed for sunshine!
            </p>
          </section>
        </div>
      </section>

      {renderGap('gap-useful-accent')}

      <section
        className="landing-accent-panel"
        aria-label="RSVP reminder section"
        data-inset-color="#e0eae6"
      >
        <img className="landing-accent-artwork" src={rsvpPageDesign} alt="RSVP reminder details" loading="lazy" />

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