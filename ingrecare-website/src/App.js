import React from 'react';
import Navbar from './components/navbar';
import HeroSection from './components/herosection';
import Features from './components/features';
import Footer from './components/footer';
import './Styles.css'; //

function App() {
  return (
    <div className="App">
      <Navbar />
      <HeroSection />
      <Features />
      <Footer />
    </div>
  );
}

export default App;
