import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users, UserPlus, MessageSquare, Search, Building, MapPin } from 'lucide-react';

interface Professional {
  id: number;
  username: string;
  fullName: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  specializations: string[];
  yearsOfExperience: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  category: string;
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: professionals, isLoading: loadingProfessionals } = useQuery<Professional[]>({
    queryKey: ['/api/professionals', searchQuery],
  });

  const { data: groups, isLoading: loadingGroups } = useQuery<Group[]>({
    queryKey: ['/api/professional-groups'],
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Professional Community</h1>
          <p className="text-muted-foreground">
            Connect with water sector professionals, join groups, and expand your professional network
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search professionals by name, company, or specialization..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="professionals" className="w-full">
          <TabsList>
            <TabsTrigger value="professionals" className="flex gap-2">
              <Users className="h-4 w-4" />
              Professionals
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex gap-2">
              <MessageSquare className="h-4 w-4" />
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professionals" className="mt-6">
            {loadingProfessionals ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : professionals?.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {professionals.map((professional) => (
                  <Card key={professional.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={`https://avatar.vercel.sh/${professional.username}`} 
                              alt={professional.fullName} 
                            />
                            <AvatarFallback>
                              {professional.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{professional.fullName}</CardTitle>
                            <CardDescription>{professional.title}</CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-4 w-4" />
                          {professional.company}
                          <MapPin className="h-4 w-4 ml-2" />
                          {professional.location}
                        </div>
                        <p className="text-sm">{professional.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {professional.specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No professionals found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            {loadingGroups ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : groups?.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{group.name}</CardTitle>
                          <CardDescription>{group.category}</CardDescription>
                        </div>
                        <Button>Join Group</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{group.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {group.memberCount} members
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No groups available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
