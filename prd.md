Product Requirements Document (PRD)
Project Title: LowTix 
Description:
LowTix is a mobile-first ticketing app that makes buying event tickets simple, fair,
and affordable. Users reported frustration with other platforms because of high fees,
reseller markups, and confusing checkout processes. LowTix fixes those pain points by
focusing on transparent pricing, secure checkout, and personalized recommendations.
Key functions include ticket search and filtering, price alerts for deals, verified user
accounts to prevent scams, and seamless payment through Apple Pay or Afterpay
Scope:
Based on analysis level 1 Specification, LowTix v1 will include features in four epics:
Search & Discovery- Event Search (artist, date, location), filters(price, distance, genre), location based suggestions
Pricing Tools- price alerts (notifications for price drops), last minute deals (flash discounts), transparent prices (no hidden fees)
Purchase and Payments- Streamlined checkout (Apple pay, Afterpay), Seatmap (interaction seat selection), order confirmation & e-ticket delivery/Refund handling
Personalization/Security & Support- Spotify/Apple Music integration, verification system, customer support (refund ticket help)
Out of Scope:
No auction style ticket sales
No loyal or rewards program
No international ticket sales or currency (launch in U.S. only)
No bulk purchasing 
No variable pricing for the same event. Based on most profitable prices only 
Technical Architecture:
Front End (Client):
React (PWA, mobile first design)
React Router for navigation 
Deploy via AWS Amplify 
BackEnd (API Layer) :
Express . js Reset API (Node . js) 
Serves as the single gateway for all data operations
Handles authentication, validation, and routing 
Organizes CRUD endpoint by feature area (e.g., /Manage Accounts, /Search/Browse, /Purchase, /Manage)
Middleware for logging, error handling, and request validation
All CRUD operations go through the API - students must not call Supabase directly from the frontend
Database & Authentication:
Supabase (Postgres - based) for: 
Data persistence 
Authentication (email/password, role-based access)
Realtime subscriptions (optional for v1)
API connects to Supabase using Supabase client or pg driver under the hood
Deployment Strategy:
Frontend: AWS Amplify (Continuously deployment from GitHub)
API Layer: Deployed as serverless functions: 
AWS Lambda (preferred) - Express wrapped with serverless-http
Database: Managed directly in Supabase cloud instance 
Development tools:
GitHub for version control and collaboration
Windsurf IDE for coding environment 
Trello for task management
Slack for team communication
Key considerations:
Separations for concerns: Clear distinction between frontend (UI), API (business logic), and DB (persistence) 
Role based access: API enforces role enforces role permissions (e.g. shopper vs. vendor).
Environment Variables: API keys stored in .env (never committed).
Scalability: Architecture is overkill for a class project, but reflects industry practices
