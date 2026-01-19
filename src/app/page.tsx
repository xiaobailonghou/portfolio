import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Blog from '@/components/Blog'
import Resume from '@/components/Resume'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Blog />
        <Resume />
        <Footer />
      </main>
    </>
  )
}
