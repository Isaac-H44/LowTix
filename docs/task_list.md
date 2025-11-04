Task List
Epic: Concert ticket affordable price

Task: Implement a search that allows users to find concerts by entering artist names or selecting specific dates
User Story: As a concertgoer, I want to search for events by artist or date so that I can easily find concerts that fit my schedule. 
Acceptance Criteria: Users can type an artist’s name into the search bar and receive matching event results. Users can search by artist and date simultaneously. Artist search result would include upcoming events, locations, and ticket availability

Task: Implement a price alert system that allows users to track ticket prices for specific events and receive notifications  when prices drop below a defined threshold
User Story: As a budget-conscious user, I want to set price alerts so that I can be notified when tickets for an event become more affordable
Acceptance Criteria: Users can set up a custom threshold for any event with available tickets. Alert setup is accessible from the event detail page. Users can choose notification preferences. System check ticket prices at regular intervals. When a ticket price drops to or below the user’s threshold, an alert is triggered.

Task: Integrate Apple Pay into LowTix checkout flow to enable secure, one tap payment for users on supporting devices and browsers. 
User Story: As a user, I want to securely checkout using Apple Pay so that I can complete my purchase quickly and safely 
Acceptance Criteria: Apple pay is available as payment option at checkout. Successful transaction redirect user to confirmation page. Error display message or error message.


Task: Design and implement an interactive seat map that allows users to visually explore seating options, view availability, and select seats before checkout.
User Story: As an attendee, I want to view an interactive seat map so that I can choose my preferred seating area before purchase.
Acceptance Criteria: Seat map loads dynamically based on selected venue and event. Selections, rows, and individual seats are clearly labeled and visually distinct. Available, reserved, and sold out seats are color coded. Seat availability updates in real time to prevent double booking. 


Task:  Implement an ID verification system that confirms user identity during account setup or ticket purchase, and display verification status to enhance trust and reduce fraud. 
User Story: As a verified user, I want my identity confirmed through ID verification so that I can trust the tickets are legitimate.
Acceptance Criteria: Users can initiate ID verification from account settings, during checkout, or during account setup. Users are guided by a step by step verification process. The system supports real time capture of government issued ID. 

Task: Integrate Spotify data into LowTix recommendation engine to personalize event suggestions based on users’ top artists, genres, and recent listening behavior. 
User Story: As a fan, I want to receive recommendations based on my Spotify listening habits so that I can discover events I’d likely to enjoy 
Acceptance Criteria: Users can securely connect their Spotify account. LowTix requests permission to access relevant listening data. Recommended events appear in a “For You” section with a label like “Based on your Spotify listening”. A “Clear Filters” button resets all selections


Task: Implement dynamic filtering controls that allows users to narrow down event listings based on geographic location and ticket price range.
User Story: As a user, I want to filter events by location and price so that I can find affordable options
Acceptance Criteria: Users can filter by city or region or “near me” using geolocation. Filter events only include events within the selected area. Users can set minimum and maximum ticket prices using sliders or input fields. Only events with ticket prices within the selected range are displayed. Users can apply both filters simultaneously.

Task: Design and implement an automated refund workflow that notifies users of cancellations and processes refunds quickly and transparently 
User Story: As a customer, I want a simple refund process if an event is cancelled so that I don’t lose money unexpectedly. 
Acceptance Criteria: Auto cancellation detection where the system can detect when an event is marked as cancelled by the organizer or venue. Cancellation can be seen on event listing and ticket dashboard. Customers receive email and in app notification within one hour of cancellation. Users can view refund status in account under “My Tickets” 

Task: Design and implement a “Last Minute Deals” feature that highlights discounted or time-sensitive ticket offers for events happening soon.
User Story: As a spontaneous buyer, I want to see last-minute ticket deals so that I can attend events without high costs
Acceptance Criteria: System flags events with unsold tickets and upcoming start times (e.g. Within 72 hours). “Last Minute Deals” tab or banner is visible on the homepage. Discounted prices clearly displayed alongside the original price.

Task: Design and implement an ad-free, streamlined ticketing interface that prioritizes clarity, speed, and ease of use for social users
User Story: As a social user, I want a clean, ad-free interface so that I can focus on purchasing tickets without distractions
Acceptance Criteria: Ad-Free Experience where there’s no third-party ads, pop-ups, or promotional banners. Minimalist UI Design where the interface uses clean layouts, intuitive navigation, and minimal visual clutter.

