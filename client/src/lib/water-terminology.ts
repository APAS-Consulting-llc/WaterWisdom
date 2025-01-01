export interface WaterTerm {
  term: string;
  definition: string;
  category: 'treatment' | 'infrastructure' | 'quality' | 'sustainability' | 'regulation';
}

export const waterTerminology: Record<string, WaterTerm> = {
  'water-treatment': {
    term: 'Water Treatment',
    definition: 'The process of removing contaminants from water to make it safe for human consumption or return to the environment.',
    category: 'treatment'
  },
  'watershed': {
    term: 'Watershed',
    definition: 'An area of land that drains all precipitation to a common outlet such as a river, bay, or other body of water.',
    category: 'infrastructure'
  },
  'potable-water': {
    term: 'Potable Water',
    definition: 'Water that is safe to drink, free from pollution, harmful organisms, and impurities.',
    category: 'quality'
  },
  'water-reclamation': {
    term: 'Water Reclamation',
    definition: 'The process of converting wastewater into water that can be reused for other purposes.',
    category: 'sustainability'
  },
  'npdes': {
    term: 'NPDES',
    definition: 'National Pollutant Discharge Elimination System - A permit program that addresses water pollution by regulating point sources that discharge pollutants.',
    category: 'regulation'
  },
  'turbidity': {
    term: 'Turbidity',
    definition: 'A measure of water clarity and how much the material suspended in water decreases the passage of light through the water.',
    category: 'quality'
  },
  'aquifer': {
    term: 'Aquifer',
    definition: 'An underground layer of water-bearing permeable rock or sediments from which groundwater can be extracted.',
    category: 'infrastructure'
  },
  'activated-sludge': {
    term: 'Activated Sludge',
    definition: 'A biological wastewater treatment process that uses microorganisms to remove organic matter from sewage.',
    category: 'treatment'
  }
};

export function getTermByCategory(category: WaterTerm['category']) {
  return Object.values(waterTerminology).filter(term => term.category === category);
}

export function searchTerms(query: string) {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(waterTerminology).filter(term => 
    term.term.toLowerCase().includes(lowercaseQuery) || 
    term.definition.toLowerCase().includes(lowercaseQuery)
  );
}
