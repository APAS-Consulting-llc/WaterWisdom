import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, Briefcase, GraduationCap, Award } from 'lucide-react';

// Define the types for our career path data
interface Skill {
  name: string;
  level: 'basic' | 'intermediate' | 'advanced';
}

interface Certification {
  name: string;
  issuer: string;
  required: boolean;
}

interface CareerNode {
  id: string;
  title: string;
  level: 'entry' | 'mid' | 'senior' | 'expert';
  description: string;
  yearsExperience: string;
  salary: string;
  skills: Skill[];
  certifications: Certification[];
  children?: string[]; // IDs of next possible positions
}

// Sample career path data
const careerPathsData: Record<string, CareerNode> = {
  'water-operator': {
    id: 'water-operator',
    title: 'Water Treatment Operator',
    level: 'entry',
    description: 'Monitor and operate water treatment equipment, perform basic maintenance, and ensure water quality standards.',
    yearsExperience: '0-2',
    salary: '$40,000 - $55,000',
    skills: [
      { name: 'Water Quality Monitoring', level: 'basic' },
      { name: 'Equipment Operation', level: 'basic' },
      { name: 'Safety Protocols', level: 'basic' }
    ],
    certifications: [
      { name: 'Water Treatment Operator Grade 1', issuer: 'State Board', required: true }
    ],
    children: ['senior-operator', 'water-technician']
  },
  'senior-operator': {
    id: 'senior-operator',
    title: 'Senior Water Treatment Operator',
    level: 'mid',
    description: 'Supervise treatment operations, manage teams, and optimize treatment processes.',
    yearsExperience: '3-5',
    salary: '$55,000 - $75,000',
    skills: [
      { name: 'Process Optimization', level: 'intermediate' },
      { name: 'Team Management', level: 'intermediate' },
      { name: 'Regulatory Compliance', level: 'intermediate' }
    ],
    certifications: [
      { name: 'Water Treatment Operator Grade 3', issuer: 'State Board', required: true },
      { name: 'Supervisor Certification', issuer: 'Industry Board', required: false }
    ],
    children: ['operations-manager']
  },
  'water-technician': {
    id: 'water-technician',
    title: 'Water Quality Technician',
    level: 'mid',
    description: 'Conduct water quality testing, maintain records, and ensure compliance with regulations.',
    yearsExperience: '2-4',
    salary: '$45,000 - $65,000',
    skills: [
      { name: 'Laboratory Analysis', level: 'intermediate' },
      { name: 'Quality Control', level: 'intermediate' },
      { name: 'Data Management', level: 'basic' }
    ],
    certifications: [
      { name: 'Laboratory Analyst Grade 1', issuer: 'State Board', required: true }
    ],
    children: ['water-quality-manager']
  },
  'operations-manager': {
    id: 'operations-manager',
    title: 'Water Operations Manager',
    level: 'senior',
    description: 'Oversee facility operations, develop policies, and manage budgets.',
    yearsExperience: '7-10',
    salary: '$75,000 - $100,000',
    skills: [
      { name: 'Strategic Planning', level: 'advanced' },
      { name: 'Budget Management', level: 'advanced' },
      { name: 'Regulatory Compliance', level: 'advanced' }
    ],
    certifications: [
      { name: 'Water Treatment Operator Grade 4', issuer: 'State Board', required: true },
      { name: 'Project Management Professional', issuer: 'PMI', required: false }
    ],
    children: ['water-director']
  },
  'water-quality-manager': {
    id: 'water-quality-manager',
    title: 'Water Quality Manager',
    level: 'senior',
    description: 'Lead water quality initiatives, develop testing programs, and ensure regulatory compliance.',
    yearsExperience: '6-8',
    salary: '$70,000 - $95,000',
    skills: [
      { name: 'Quality Assurance', level: 'advanced' },
      { name: 'Environmental Regulations', level: 'advanced' },
      { name: 'Program Development', level: 'intermediate' }
    ],
    certifications: [
      { name: 'Laboratory Analyst Grade 3', issuer: 'State Board', required: true },
      { name: 'Environmental Compliance', issuer: 'EPA', required: false }
    ],
    children: ['water-director']
  },
  'water-director': {
    id: 'water-director',
    title: 'Water Utilities Director',
    level: 'expert',
    description: 'Direct overall water utility operations, develop strategic plans, and ensure long-term sustainability.',
    yearsExperience: '12+',
    salary: '$100,000 - $150,000',
    skills: [
      { name: 'Strategic Leadership', level: 'advanced' },
      { name: 'Stakeholder Management', level: 'advanced' },
      { name: 'Infrastructure Planning', level: 'advanced' }
    ],
    certifications: [
      { name: 'Water Treatment Operator Grade 4', issuer: 'State Board', required: true },
      { name: 'Executive Management', issuer: 'Industry Board', required: false }
    ],
    children: []
  }
};

export default function CareerPathMap() {
  const [selectedNode, setSelectedNode] = useState<CareerNode>(careerPathsData['water-operator']);

  const getLevelColor = (level: CareerNode['level']) => {
    switch (level) {
      case 'entry':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getSkillColor = (level: Skill['level']) => {
    switch (level) {
      case 'basic':
        return 'bg-slate-100 text-slate-800';
      case 'intermediate':
        return 'bg-indigo-100 text-indigo-800';
      case 'advanced':
        return 'bg-violet-100 text-violet-800';
    }
  };

  return (
    <div className="grid md:grid-cols-[1fr_400px] gap-6">
      {/* Career Path Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Water Sector Career Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[600px] p-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full h-full"
              >
                {/* Entry Level */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <Button
                    variant={selectedNode.id === 'water-operator' ? 'default' : 'outline'}
                    className="w-48"
                    onClick={() => setSelectedNode(careerPathsData['water-operator'])}
                  >
                    Water Treatment Operator
                  </Button>
                </div>

                {/* Mid Level */}
                <div className="absolute top-1/3 flex justify-center w-full gap-32">
                  <Button
                    variant={selectedNode.id === 'senior-operator' ? 'default' : 'outline'}
                    className="w-48"
                    onClick={() => setSelectedNode(careerPathsData['senior-operator'])}
                  >
                    Senior Operator
                  </Button>
                  <Button
                    variant={selectedNode.id === 'water-technician' ? 'default' : 'outline'}
                    className="w-48"
                    onClick={() => setSelectedNode(careerPathsData['water-technician'])}
                  >
                    Water Quality Technician
                  </Button>
                </div>

                {/* Senior Level */}
                <div className="absolute top-2/3 flex justify-center w-full gap-32">
                  <Button
                    variant={selectedNode.id === 'operations-manager' ? 'default' : 'outline'}
                    className="w-48"
                    onClick={() => setSelectedNode(careerPathsData['operations-manager'])}
                  >
                    Operations Manager
                  </Button>
                  <Button
                    variant={selectedNode.id === 'water-quality-manager' ? 'default' : 'outline'}
                    className="w-48"
                    onClick={() => setSelectedNode(careerPathsData['water-quality-manager'])}
                  >
                    Quality Manager
                  </Button>
                </div>

                {/* Expert Level */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  <Button
                    variant={selectedNode.id === 'water-director' ? 'default' : 'outline'}
                    className="w-48"
                    onClick={() => setSelectedNode(careerPathsData['water-director'])}
                  >
                    Water Utilities Director
                  </Button>
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                  <path
                    d="M 400,80 L 250,200"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 400,80 L 550,200"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 250,200 L 250,320"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 550,200 L 550,320"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 250,320 L 400,440"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 550,320 L 400,440"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Details */}
      <Card className="h-[800px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Position Details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">{selectedNode.title}</h3>
                <Badge 
                  variant="secondary" 
                  className={`mt-2 ${getLevelColor(selectedNode.level)}`}
                >
                  {selectedNode.level.charAt(0).toUpperCase() + selectedNode.level.slice(1)} Level
                </Badge>
              </div>

              <div>
                <p className="text-gray-600">{selectedNode.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{selectedNode.yearsExperience} years</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-sm text-gray-500">Salary Range</p>
                  <p className="font-medium">{selectedNode.salary}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4" />
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.skills.map((skill) => (
                    <Badge 
                      key={skill.name}
                      variant="secondary"
                      className={getSkillColor(skill.level)}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4" />
                  Certifications
                </h4>
                <div className="space-y-2">
                  {selectedNode.certifications.map((cert) => (
                    <div
                      key={cert.name}
                      className="p-2 bg-background rounded-lg border flex items-start gap-2"
                    >
                      <Badge variant={cert.required ? 'default' : 'outline'}>
                        {cert.required ? 'Required' : 'Optional'}
                      </Badge>
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-gray-500">{cert.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNode.children && selectedNode.children.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Next Career Steps</h4>
                  <div className="space-y-2">
                    {selectedNode.children.map((childId) => (
                      <Button
                        key={childId}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setSelectedNode(careerPathsData[childId])}
                      >
                        {careerPathsData[childId].title}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
