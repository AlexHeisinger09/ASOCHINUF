import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Activity, Utensils, HeartPulse, 
  Droplet, Facebook, Instagram, Twitter, Linkedin, 
  GraduationCap, Clock, Award, Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import LoginModal from './LoginModal';
import { mockData } from '../mock';

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  // Rotating texts animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % mockData.hero.rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  // Icon mapping
  const iconMap = {
    activity: Activity,
    utensils: Utensils,
    'heart-pulse': HeartPulse,
    droplet: Droplet,
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Transparent with blur on scroll */}
      <motion.header 
        style={{ backgroundColor: `rgba(0, 0, 0, ${headerOpacity.get() * 0.8})` }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-[#8c5cff]/20 transition-all duration-300"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-[#8c5cff] cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => scrollToSection('#hero')}
          >
            ASOCHINUF
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('#cursos')} className="text-gray-300 hover:text-[#8c5cff] transition-colors duration-200 relative group">
              Cursos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8c5cff] transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('#capacitaciones')} className="text-gray-300 hover:text-[#8c5cff] transition-colors duration-200 relative group">
              Capacitaciones
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8c5cff] transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('#profesionales')} className="text-gray-300 hover:text-[#8c5cff] transition-colors duration-200 relative group">
              Profesionales
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8c5cff] transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('#organigrama')} className="text-gray-300 hover:text-[#8c5cff] transition-colors duration-200 relative group">
              Organigrama
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8c5cff] transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-[#8c5cff] transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#2a2c33] border-t border-[#8c5cff]/20"
            >
              <nav className="flex flex-col space-y-4 p-4">
                <button onClick={() => scrollToSection('#cursos')} className="text-left text-gray-300 hover:text-[#8c5cff] transition-colors duration-200">Cursos</button>
                <button onClick={() => scrollToSection('#capacitaciones')} className="text-left text-gray-300 hover:text-[#8c5cff] transition-colors duration-200">Capacitaciones</button>
                <button onClick={() => scrollToSection('#profesionales')} className="text-left text-gray-300 hover:text-[#8c5cff] transition-colors duration-200">Profesionales</button>
                <button onClick={() => scrollToSection('#organigrama')} className="text-left text-gray-300 hover:text-[#8c5cff] transition-colors duration-200">Organigrama</button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a2e] to-black opacity-90"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8c5cff]/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8c5cff]/10 rounded-full blur-3xl"
          />
          {/* Sparkle effects */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.7,
              }}
              className="absolute"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
              }}
            >
              <Sparkles className="text-[#8c5cff]/30" size={20} />
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto flex-1 flex flex-col justify-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent"
          >
            {mockData.hero.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-3xl text-gray-300 mb-4 font-semibold"
          >
            {mockData.hero.subtitle}
          </motion.p>
          
          {/* Rotating text animation */}
          <div className="h-16 md:h-20 mb-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTextIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-lg md:text-xl text-[#8c5cff] font-medium"
              >
                {mockData.hero.rotatingTexts[currentTextIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#8c5cff] hover:bg-[#7a4de6] text-white text-lg px-12 py-7 rounded-full font-semibold shadow-2xl hover:shadow-[#8c5cff]/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            >
              <span className="relative z-10">{mockData.hero.ctaText}</span>
              <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Sponsors Carousel */}
        <div className="relative z-10 w-full py-12 overflow-hidden">
          <div className="sponsors-carousel-wrapper">
            <motion.div 
              className="sponsors-carousel flex gap-16 items-center"
              animate={{
                x: [0, -1920]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear"
                }
              }}
            >
              {/* Duplicate sponsors for seamless loop */}
              {[...mockData.sponsors, ...mockData.sponsors].map((sponsor, index) => (
                <div
                  key={`${sponsor.id}-${index}`}
                  className="sponsor-logo flex-shrink-0 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer"
                >
                  <span className="text-white/80 hover:text-white font-bold text-2xl transition-colors duration-300">{sponsor.logo}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cursos Section */}
      <section id="cursos" className="py-24 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#8c5cff]"
          >
            Nuestros Cursos
          </motion.h2>

          <div className="space-y-24">
            {mockData.cursos.map((curso, index) => (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
                className={`grid md:grid-cols-2 gap-8 items-center ${curso.imagePosition === 'right' ? 'md:grid-flow-dense' : ''}`}
              >
                <div className={curso.imagePosition === 'right' ? 'md:col-start-2' : ''}>
                  <div className="relative h-80 bg-gradient-to-br from-[#8c5cff]/20 to-[#2a2c33] rounded-2xl overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      <GraduationCap size={80} className="text-[#8c5cff]" />
                    </div>
                    <div className="absolute inset-0 bg-[#8c5cff]/0 group-hover:bg-[#8c5cff]/10 transition-colors duration-500"></div>
                  </div>
                </div>
                <div className={curso.imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}>
                  <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#8c5cff] transition-colors duration-300">{curso.title}</h3>
                  <p className="text-gray-400 text-lg mb-6">{curso.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-[#8c5cff] hover:scale-110 transition-transform duration-200">
                      <Clock size={20} />
                      <span>{curso.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8c5cff] hover:scale-110 transition-transform duration-200">
                      <Award size={20} />
                      <span>{curso.level}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capacitaciones Section */}
      <section id="capacitaciones" className="py-24 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#8c5cff]"
          >
            Capacitaciones Especializadas
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockData.capacitaciones.map((capacitacion, index) => {
              const IconComponent = iconMap[capacitacion.icon];
              return (
                <motion.div
                  key={capacitacion.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="bg-[#2a2c33] border-[#8c5cff]/20 hover:border-[#8c5cff] transition-all duration-300 h-full hover:shadow-xl hover:shadow-[#8c5cff]/20 group">
                    <CardHeader>
                      <div className="w-16 h-16 bg-[#8c5cff]/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#8c5cff]/30 transition-all duration-300 group-hover:rotate-12">
                        {IconComponent && <IconComponent className="text-[#8c5cff] group-hover:scale-110 transition-transform duration-300" size={32} />}
                      </div>
                      <CardTitle className="text-white text-xl group-hover:text-[#8c5cff] transition-colors duration-300">{capacitacion.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 mb-4">
                        {capacitacion.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-[#8c5cff] text-sm">
                        <Clock size={16} />
                        <span>{capacitacion.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Profesionales/Testimonios Section */}
      <section id="profesionales" className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#8c5cff]"
          >
            Nuestros Profesionales
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {mockData.testimonios.map((testimonio, index) => (
              <motion.div
                key={testimonio.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="bg-[#2a2c33] border-[#8c5cff]/20 hover:border-[#8c5cff] transition-all duration-300 h-full group hover:shadow-xl hover:shadow-[#8c5cff]/20">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-br from-[#8c5cff] to-[#6a3dcf] rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                      {testimonio.name.charAt(0)}
                    </div>
                    <CardTitle className="text-white group-hover:text-[#8c5cff] transition-colors duration-300">{testimonio.name}</CardTitle>
                    <CardDescription className="text-[#8c5cff]">{testimonio.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 italic mb-4">"{testimonio.quote}"</p>
                    <p className="text-sm text-gray-500">{testimonio.team}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Organigrama Section */}
      <section id="organigrama" className="py-24 px-4 bg-black relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#8c5cff]"
          >
            {mockData.organigrama.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-400 mb-16 text-lg"
          >
            {mockData.organigrama.subtitle}
          </motion.p>

          <div className="space-y-8">
            {[1, 2, 3].map((nivel) => {
              const miembros = mockData.organigrama.estructura.filter(m => m.nivel === nivel);
              return (
                <div key={nivel} className="flex flex-col items-center">
                  <div className={`grid gap-6 w-full ${nivel === 1 ? 'grid-cols-1 max-w-md' : nivel === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3 max-w-5xl'}`}>
                    {miembros.map((miembro, index) => (
                      <motion.div
                        key={miembro.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.15,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ y: -5, scale: 1.03 }}
                        className="cursor-pointer"
                      >
                        <Card className="bg-gradient-to-br from-[#2a2c33] to-[#1a1c22] border-[#8c5cff]/30 hover:border-[#8c5cff] transition-all duration-300 hover:shadow-lg hover:shadow-[#8c5cff]/20 group">
                          <CardHeader>
                            <div className="w-16 h-16 bg-gradient-to-br from-[#8c5cff] to-[#6a3dcf] rounded-full mb-3 flex items-center justify-center text-white text-xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                              {miembro.nombre.split(' ').map(n => n.charAt(0)).join('')}
                            </div>
                            <CardTitle className="text-white text-center text-lg group-hover:text-[#8c5cff] transition-colors duration-300">{miembro.cargo}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <p className="text-[#8c5cff] font-semibold mb-2">{miembro.nombre}</p>
                            <p className="text-gray-400 text-sm">{miembro.area}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  {nivel < 3 && (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="w-0.5 h-12 bg-gradient-to-b from-[#8c5cff] to-transparent my-4"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#8c5cff]/20 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-[#8c5cff] mb-4">ASOCHINUF</h3>
              <p className="text-gray-400">Asociación Chilena de Nutricionistas de Fútbol</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navegación</h4>
              <nav className="flex flex-col space-y-2">
                {mockData.footer.navigation.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-[#8c5cff] transition-colors duration-200 text-left hover:translate-x-2 transform transition-transform"
                  >
                    {link.name}
                  </button>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Redes Sociales</h4>
              <div className="flex gap-4">
                {mockData.footer.social.map((social) => {
                  const IconComponent = iconMap[social.icon];
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      className="w-10 h-10 bg-[#2a2c33] rounded-full flex items-center justify-center text-[#8c5cff] hover:bg-[#8c5cff] hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-12"
                      aria-label={social.name}
                    >
                      {IconComponent && <IconComponent size={20} />}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="border-t border-[#8c5cff]/20 pt-8 text-center text-gray-500">
            <p>{mockData.footer.copyright}</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Home;
