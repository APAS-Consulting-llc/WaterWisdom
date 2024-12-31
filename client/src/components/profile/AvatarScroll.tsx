import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface Expert {
  id: number;
  name: string;
  role: string;
  image?: string;
}

const experts: Expert[] = [
  {
    id: 1,
    name: "Dr. Hardeep Anand",
    role: "Water Sector Professional",
    image: "/hardeep.jpg"
  },
  {
    id: 2,
    name: "Dr. Sarah Chen",
    role: "Environmental Engineer",
    image: "/sarah.jpg"
  },
  {
    id: 3,
    name: "Prof. James Waters",
    role: "Water Policy Expert",
    image: "/james.jpg"
  },
  {
    id: 4,
    name: "Dr. Maria Rodriguez",
    role: "Conservation Specialist",
    image: "/maria.jpg"
  },
  {
    id: 5,
    name: "Dr. Ahmed Hassan",
    role: "Water Technology Innovation",
    image: "/ahmed.jpg"
  }
];

export function AvatarScroll() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert>(experts[0]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 200;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 py-4 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {experts.map((expert) => (
            <motion.div
              key={expert.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedExpert(expert)}
              className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                selectedExpert.id === expert.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <Avatar className="h-20 w-20">
                <AvatarImage src={expert.image} alt={expert.name} />
                <AvatarFallback>
                  {expert.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-lg hover:bg-white"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-lg hover:bg-white"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={selectedExpert.id}
        className="text-center mt-4"
      >
        <h3 className="text-lg font-semibold">{selectedExpert.name}</h3>
        <p className="text-sm text-muted-foreground">{selectedExpert.role}</p>
      </motion.div>
    </div>
  );
}
