import { getLatestNotes } from "@/actions/public"
import { HeroSection } from "@/components/home/hero-section"
import { LatestNotesGrid } from "@/components/home/latest-notes-grid"

export default async function HomePage() {
  const notes = await getLatestNotes()

  return (
    <div className="min-h-screen">
      <HeroSection />
      <LatestNotesGrid notes={notes} />
    </div>
  )
}
