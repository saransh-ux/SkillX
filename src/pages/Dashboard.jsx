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
import RoleEvolution from '../components/RoleEvolution';
import IndustryShift from '../components/IndustryShift';
import SignalInsight from '../components/SignalInsight';
import FutureScan from '../components/FutureScan';
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
        'junior-success',
        'senior-success',
        'career-scan',
        'copilot',
        'role-evolution',
        'industry-shift',
        'the-signal',
        'future-scan'
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

        {/* 01 / Market Pulse: Top Skill Demand Radar */}
        <SkillRadar />

        {/* 02 / Skill Genome: Co-Occurrence Graph */}
        <SkillGenome />

        {/* 03 / Junior Success: Technical Predictive Model */}
        <JuniorSuccess />

        {/* 04 / Senior Success: Big Five Psychometric Model */}
        <SeniorSuccess />

        {/* 05 / Career Scan: Evidence-Derived Synthesis */}
        <CareerScan />

        {/* 06 / Copilot: Conversational Analytics Interface */}
        <Copilot />

        {/* 07 / Role Evolution */}
        <RoleEvolution />

        {/* 08 / Industry Shift */}
        <IndustryShift />

        {/* Featured Research Finding: THE SIGNAL */}
        <SignalInsight />

        {/* 09 / Future Scan Simulator */}
        <FutureScan />
      </main>

      {/* Minimal Footer */}
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}
