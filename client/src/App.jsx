import { Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { BrowseEventsPage } from './pages/BrowseEventsPage.jsx';
import { EventDetailsPage } from './pages/EventDetailsPage.jsx';
import { SignInPage } from './pages/SignInPage.jsx';
import { SignUpPage } from './pages/SignUpPage.jsx';
import { FeedPage } from './pages/FeedPage.jsx';
import { MyOrdersPage } from './pages/MyOrdersPage.jsx';
import { AccountSettingsPage } from './pages/AccountSettingsPage.jsx';
import { InventoryIntakePage } from './pages/InventoryIntakePage.jsx';
import { PricingRulesPage } from './pages/PricingRulesPage.jsx';
import { EventsManagementPage } from './pages/EventsManagementPage.jsx';
import { RequireAuth } from './auth/AuthContext.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseEventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route
            path="/orders"
            element={(
              <RequireAuth>
                <MyOrdersPage />
              </RequireAuth>
            )}
          />
          <Route
            path="/account"
            element={(
              <RequireAuth>
                <AccountSettingsPage />
              </RequireAuth>
            )}
          />
          <Route path="/admin/inventory" element={<InventoryIntakePage />} />
          <Route path="/admin/pricing-rules" element={<PricingRulesPage />} />
          <Route path="/admin/events" element={<EventsManagementPage />} />
        </Routes>
      </main>
    </div>
  );
}
