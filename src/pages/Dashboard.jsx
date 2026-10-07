import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import IntelligenceStrip from '../components/IntelligenceStrip';
import SkillRadar from '../components/SkillRadar';
import SkillGenome from '../components/SkillGenome';
import JuniorSuccess from '../components/JuniorSuccess';
import SeniorSuccess from '../components/SeniorSuccess';
import CareerScan from '../components/CareerScan';
import Copilot from '../components/Copilot';
import Footer from '../components/Footer';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'overview',
        'skill-radar',
        'skill-genome',
        'career-success',
        'senior-success',
        'career-scan',
        'copilot'
      ];
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#171717] selection:bg-[#FF4D2E] selection:text-white flex flex-col font-sans">
      {/* Top Header */}
      <Header activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Editorial Hero Intro */}
        <Hero onExplore={scrollToSection} />

        {/* Continuous Horizontal Intelligence Strip */}
        <IntelligenceStrip onMetricClick={scrollToSection} />

        {/* 01 / Market Pulse */}
        <SkillRadar />

        {/* 02 / Skill Genome */}
        <SkillGenome />

        {/* 03 / Career Success */}
        <JuniorSuccess />

        {/* 04 / Senior Success */}
        <SeniorSuccess />

        {/* 05 / Career Scan */}
        <CareerScan />

        {/* 06 / Copilot */}
        <Copilot />
      </main>

      {/* Minimal Footer */}
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}
