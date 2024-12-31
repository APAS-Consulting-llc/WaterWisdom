import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { useUser } from '@/hooks/use-user';
import { FileDown, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  modernLayout: {
    display: 'flex',
    flexDirection: 'row',
  },
  traditionalLayout: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  entry: {
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  entrySubtitle: {
    fontSize: 10,
    color: '#666',
  },
  entryDetails: {
    fontSize: 10,
    marginTop: 2,
  },
});

const layouts = {
  modern: 'Modern - Split Layout',
  traditional: 'Traditional - Single Column',
  compact: 'Compact - Minimalist',
};

type ResumeData = {
  credentials: any[];
  publications: any[];
  achievements: any[];
  skills: any[];
};

const ResumeDocument = ({ data, layout }: { data: ResumeData; layout: keyof typeof layouts }) => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={layout === 'modern' ? styles.modernLayout : styles.traditionalLayout}>
          <View style={styles.header}>
            <Text style={styles.title}>{user.username}</Text>
            <Text style={styles.subtitle}>Water Industry Professional</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Certifications</Text>
            {data.credentials.map((credential, index) => (
              <View key={index} style={styles.entry}>
                <Text style={styles.entryTitle}>{credential.title}</Text>
                <Text style={styles.entrySubtitle}>{credential.issuingOrganization}</Text>
                <Text style={styles.entryDetails}>
                  Issued: {new Date(credential.issueDate).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Publications</Text>
            {data.publications.map((publication, index) => (
              <View key={index} style={styles.entry}>
                <Text style={styles.entryTitle}>{publication.title}</Text>
                <Text style={styles.entrySubtitle}>
                  {publication.publishedIn} ({new Date(publication.publicationDate).getFullYear()})
                </Text>
                <Text style={styles.entryDetails}>{publication.authors}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {data.achievements.map((achievement, index) => (
              <View key={index} style={styles.entry}>
                <Text style={styles.entryTitle}>{achievement.name}</Text>
                <Text style={styles.entryDetails}>{achievement.description}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            {data.skills.map((skill, index) => (
              <View key={index} style={styles.entry}>
                <Text style={styles.entryTitle}>{skill.subject}</Text>
                <Text style={styles.entryDetails}>Proficiency: {skill.level}%</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default function ResumeGenerator() {
  const [selectedLayout, setSelectedLayout] = useState<keyof typeof layouts>('modern');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const { data: credentials = [], isLoading: isLoadingCredentials } = useQuery({
    queryKey: ['/api/user/credentials'],
    enabled: !!user,
  });

  const { data: publications = [], isLoading: isLoadingPublications } = useQuery({
    queryKey: ['/api/user/publications'],
    enabled: !!user,
  });

  const { data: achievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/achievements'],
    enabled: !!user,
  });

  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ['/api/skills'],
    enabled: !!user,
    initialData: [
      { subject: 'Water Treatment', level: 85 },
      { subject: 'Quality Control', level: 75 },
      { subject: 'Sustainability', level: 90 },
      { subject: 'Regulations', level: 70 },
      { subject: 'Innovation', level: 80 },
    ],
  });

  const isLoading = isLoadingCredentials || isLoadingPublications || isLoadingAchievements || isLoadingSkills;

  const resumeData = {
    credentials,
    publications,
    achievements,
    skills,
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Professional Resume
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Select
              value={selectedLayout}
              onValueChange={(value) => setSelectedLayout(value as keyof typeof layouts)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(layouts).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewOpen ? 'Hide Preview' : 'Preview'}
              </Button>

              <PDFDownloadLink
                document={<ResumeDocument data={resumeData} layout={selectedLayout} />}
                fileName={`professional-resume-${Date.now()}.pdf`}
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>

          {isPreviewOpen && (
            <div className="border rounded-lg h-[600px] mt-4">
              <PDFViewer width="100%" height="100%" className="rounded-lg">
                <ResumeDocument data={resumeData} layout={selectedLayout} />
              </PDFViewer>
            </div>
          )}
        </div>
        <p className="text-sm text-blue-400 mt-2">Generated by One Water.AI</p>
      </CardContent>
    </Card>
  );
}