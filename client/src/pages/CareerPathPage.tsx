import CareerPathMap from '@/components/career/CareerPathMap';

export default function CareerPathPage() {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-4">Water Sector Career Paths</h1>
        <p className="text-lg text-muted-foreground">
          Explore various career paths in the water sector, from entry-level positions to executive roles. 
          Discover the skills, certifications, and experience needed to advance your career in water management 
          and sustainability.
        </p>
      </div>

      <CareerPathMap />
    </div>
  );
}
