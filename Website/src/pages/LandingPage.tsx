import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { Hero } from '../components/sections/Hero'
import { SeeItWork } from '../components/sections/SeeItWork'
import { HowItWorks } from '../components/sections/HowItWorks'
import { Features } from '../components/sections/Features'
import { FitsWorkflow } from '../components/sections/FitsWorkflow'
import { FounderStory } from '../components/sections/FounderStory'
import { Pricing } from '../components/sections/Pricing'
import { FAQ } from '../components/sections/FAQ'
import { CourseTeaser } from '../components/sections/CourseTeaser'
import { FinalCTA } from '../components/sections/FinalCTA'

export function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SeeItWork />
        <HowItWorks />
        <Features />
        <FitsWorkflow />
        <FounderStory />
        <Pricing />
        <FAQ />
        <CourseTeaser />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
