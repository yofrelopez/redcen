import { getLatestNotes } from "@/actions/public"
import { getInstitutions } from "@/actions/notes"
import { HeroSection } from "@/components/home/hero-section"
import { LatestNotesGrid } from "@/components/home/latest-notes-grid"
import { FeaturedInstitutions } from "@/components/home/featured-institutions"

export default async function HomePage() {
  const [notes, institutions] = await Promise.all([
    getLatestNotes(),
    getInstitutions()
  ])

  return (
    <div className="min-h-screen">
      {/* <HeroSection /> */}
      <LatestNotesGrid notes={notes} />
      <FeaturedInstitutions institutions={institutions} />
    </div>
  )
}
