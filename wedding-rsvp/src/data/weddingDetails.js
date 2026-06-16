export const weddingDetails = {
  coupleNames: 'Alyza & Mark',
  weddingDateIso: '2027-06-26',
  rsvpDeadlineIso: '2026-08-31',
  schedule: [
    '12:30 PM - Guests arrive at Mount Stuart',
    '1:00 PM - Wedding Ceremony',
    '2:00 PM - Drinks reception and photographs',
    '3:30 PM - Call to dinner',
    '3:45 PM - Speeches',
    '4:30 PM - Dinner in the Marble Hall',
    '6:30 PM - Room turnaround',
    '7:00 PM - Cutting of the cake, followed by first dance',
    '9:30 PM - Evening buffet',
    '1:00 AM - Bar closes - all guests to leave'
  ],
  venue: {
    name: 'Mount Stuart',
    address: 'Mount Stuart House, Isle of Bute, Scotland, PA20 9LR',
    mapEmbedUrl: 'https://www.google.com/maps?q=55.84,-4.66&z=9&output=embed'
  },
  note: "We can't wait to celebrate with you! Please RSVP, including menu choices, by 31st August 2026.",
  travelSections: [
    {
      title: 'By Ferry',
      body: 'Sail with CalMac from Wemyss Bay to Rothesay - approx. 35 minutes. Book in advance at calmac.co.uk or via this website.'
    },
    {
      title: 'By Car',
      body: 'Wemyss Bay is approx. 45 minutes from Glasgow city centre. Parking available at the ferry terminal.'
    },
    {
      title: 'By Train',
      body: 'Direct trains run from Glasgow Central to Wemyss Bay, connecting straight to the ferry terminal - no car needed.'
    },
    {
      title: 'From the Ferry to Mount Stuart',
      body: 'Mount Stuart is approx. 5 miles south of Rothesay. Taxis are available, but pre-booking is strongly recommended as availability on the island is limited. Recommended local taxi services are listed on the website.'
    }
  ],
  ferries: {
    operator: 'CalMac',
    operatorUrl: 'https://www.calmac.co.uk'
  },
  internationalGuests: {
    visaUrl: 'https://www.gov.uk/check-uk-visa',
    visaText: 'Please check your UK entry requirements well in advance. Requirements vary by nationality and passport.',
    airports: [
      {
        name: 'Glasgow International (GLA)',
        detail: 'Around 45 minutes by car or taxi to Wemyss Bay. Car hire is available, or take a transfer directly to Wemyss Bay.'
      },
      {
        name: 'Glasgow Prestwick (PIK)',
        detail: 'Around 40 minutes by car to Wemyss Bay. You can also train from Prestwick Town to Glasgow Central, then direct to Wemyss Bay.'
      },
      {
        name: 'Edinburgh (EDI)',
        detail: 'Around 1.5 hours by car to Wemyss Bay. Or tram to Edinburgh Waverley, train to Glasgow Central, then direct to Wemyss Bay.'
      }
    ]
  },
  accommodation: {
    intro: 'Bute is beautiful but small - book early, spaces fill quickly!',
    sections: [
      {
        title: 'Hotels',
        places: [
          { name: 'Glenburn Hotel', detail: '01700 502500 - info@theglenburnhotel.co.uk' },
          { name: 'Kingarth Hotel', detail: '01700 831 662 - info@kingarthhotel.co.uk' }
        ]
      },
      {
        title: 'Bed & Breakfast',
        places: [
          { name: 'The Ardyne Guest House', detail: '01700 502052 - info@theardyneguesthouse.co.uk' },
          { name: 'Glendale Guest House', detail: '01700 202329 - glendalebute@yahoo.com' },
          { name: 'The Boat House', detail: '01700 502696 - enquiries@theboathouse-bute.co.uk' },
          { name: 'Highlander House', detail: '01700 500460' }
        ]
      },
      {
        title: 'Self-Catering & Apartments',
        places: [
          { name: 'Lexington Apartments', detail: '01700 505005 - stay@lexingtonapartmentsbute.co.uk' },
          { name: 'Kames Castle Cottages', detail: '01700 504886 - info@kamescastlecottages.co.uk' },
          { name: 'St Blanes House', detail: '01700 831224' },
          { name: 'The Coach House at Stewart Hall', detail: '01700 500006 / 07831 359639 - info@stewarthallbute.com' },
          { name: 'Kildavannan Schoolhouse', detail: 'abigail@laurianconsultancy.co.uk' }
        ]
      }
    ]
  },
  menuPack: {
    intro: 'Please select one option per course when you RSVP.',
    legend: 'Allergens listed in brackets. (v) vegetarian · (Ve) vegan',
    sections: [
      {
        title: 'Starter',
        options: [
          {
            dish: "Beggar's Purse of Haggis with Clapshot of Neeps & Tatties, Glayva Cream Reduction",
            allergens: 'Contains: gluten, milk, egg, mustard'
          },
          {
            dish: 'Asparagus and Gruyere Cheese Tart with Dressed Rocket (v)',
            allergens: 'Contains: gluten, egg, milk'
          }
        ]
      },
      {
        title: 'Intermediate',
        options: [
          {
            dish: 'Compressed Watermelon Gin & Tonic Essence (served to all guests)'
          }
        ]
      },
      {
        title: 'Main',
        options: [
          {
            dish: 'Chicken Stuffed with Mozzarella & Green Pesto, Wrapped in Parma Ham, Roasted Tomato & Fresh Basil Sauce',
            allergens: 'Contains: milk, egg, sulphites'
          },
          {
            dish: 'Fillet Mignon with Red Wine Reduction and Roasted Vine Tomatoes',
            allergens: 'Contains: sulphites'
          },
          {
            dish: 'Tomato, Olive and Vegan Cheese Puff Tart with Sun Dried Tomato & Pesto Dressing (Ve)',
            allergens: 'Contains: gluten, soya'
          }
        ]
      },
      {
        title: 'Dessert',
        options: [
          {
            dish: 'Rhubarb Parfait with Rhubarb Compote and Oatmeal Shortbread Crumb',
            allergens: 'Contains: gluten, egg, milk, soya, sulphites'
          },
          {
            dish: 'Chocolate & Orange Torte with Burnt Orange and Mascarpone Cream',
            allergens: 'Contains: gluten, egg, milk, nuts/almonds, soya'
          }
        ]
      }
    ],
    childrenMenu: "Melon with Mango Coulis · Macaroni & Cheese with Potato Wedges · Chocolate Brownie with Ice Cream"
  },
  faq: [
    {
      question: 'Is there a dress code?',
      answer: 'Formal attire. Please avoid white or ivory tones.'
    },
    {
      question: 'Can I bring children?',
      answer: 'Our celebration is adults-only unless your invitation states otherwise.'
    },
    {
      question: 'Can I update my RSVP later?',
      answer: 'Yes. Re-open your invite link anytime before the RSVP deadline.'
    }
  ]
};
