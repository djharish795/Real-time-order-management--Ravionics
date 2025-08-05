import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { CreateOrder } from './pages/CreateOrder';
import { OrderDetail } from './pages/OrderDetail';

// Import CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="main-content">
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateOrder />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Routes>
          </main>
        </div>
        
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
};

export default App;
