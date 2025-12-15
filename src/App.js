import './App.css';
import React, { useEffect, useMemo, useState } from 'react';
import Home from './pages/Home';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Approve from './pages/Approve';
import MyRequests from './pages/MyRequests';
import EditRegistration from './pages/EditRegistration';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import './styles/Layout.css';
import { getCurrentUserFromStorage } from './services/storage';

const routes = {
  '': 'home',
  '#/': 'home',
  '#/home': 'home',
  '#/register': 'register',
  '#/admin': 'admin',
  '#/approve': 'approve',
  '#/my-requests': 'my-requests'
};

function App() {
  const [route, setRoute] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const onHashChange = () => {
      const key = window.location.hash || '#/home';
      if (key.startsWith('#/edit/')) {
        setRoute('edit');
      } else {
        setRoute(routes[key] || 'home');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    async function loadUser() {
      setCurrentUser(await getCurrentUserFromStorage());
    }
    loadUser();
  }, []);

  const view = useMemo(() => {
    switch (route) {
      case 'register':
        return <Register currentUser={currentUser} onAuthChange={setCurrentUser} />;
      case 'admin':
        return <Admin currentUser={currentUser} onAuthChange={setCurrentUser} />;
      case 'approve':
        return <Approve currentUser={currentUser} onAuthChange={setCurrentUser} />;
      case 'my-requests':
        return <MyRequests />;
      case 'edit':
        return <EditRegistration />;
      case 'home':
      default:
        return <Home />;
    }
  }, [route, currentUser]);

  return (
    <div className="AppRoot">
      <Header currentUser={currentUser} onAuthChange={setCurrentUser} />
      <div className="MainContainer">
        <main className="ContentArea">
          {view}
        </main>
      </div>
      <MobileNav currentUser={currentUser} />
      <footer className="Footer">© {new Date().getFullYear()} bijlesengels</footer>
    </div>
  );
}

export default App;
