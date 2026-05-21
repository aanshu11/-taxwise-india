import { useTaxStore } from './store/useTaxStore';
import LandingPage from './components/LandingPage';
import Wizard from './components/Wizard';
import LivePreview from './components/LivePreview';
import ResultsPage from './components/ResultsPage';
import './App.css';

function App() {
  const view = useTaxStore((state) => state.view);
  const setView = useTaxStore((state) => state.setView);
  
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => setView('landing')}>
          <div className="logo-icon">TW</div>
          <span>TaxWise India</span>
        </div>
        <div className="badge-fy">
          FY 2025–26 (New vs Old)
        </div>
      </header>

      {/* Main Container Grid */}
      <main className={`main-content ${view === 'wizard' ? 'has-sidebar' : ''} ${view === 'results' ? 'results-view' : ''}`}>
        
        {/* Render views dynamically */}
        {view === 'landing' && <LandingPage />}
        
        {view === 'wizard' && (
          <section className="card animate-fade-in">
            <Wizard />
          </section>
        )}

        {view === 'results' && (
          <section className="results-section animate-fade-in">
            <ResultsPage />
          </section>
        )}

        {/* Right Column: Live Preview Panel (Only visible in Wizard view on desktop) */}
        {view === 'wizard' && (
          <aside className="preview-panel card animate-fade-in">
            <LivePreview />
          </aside>
        )}

      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          🔒 <strong>Privacy First:</strong> Your salary data is processed 100% locally in your web browser. 
          No information is sent to any servers or stored anywhere.
        </p>
        <p style={{ marginTop: '6px' }}>
          &copy; {new Date().getFullYear()} TaxWise India. Based on latest FY 2025–26 income tax provisions.
        </p>
      </footer>
    </div>
  );
}

export default App;
