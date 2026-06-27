import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Container, Grid, Stack } from '@/design-system/layout';
import { Card, Button, Badge } from '@/design-system/primitives';
import { Text, Heading } from '@/design-system/typography';
import { Search, MapPin, Users, Filter, Code, Trophy, Calendar } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/constants/commonData';
import toast from 'react-hot-toast';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/hackathons`, { withCredentials: true });
      setHackathons(res.data);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      toast.error('Failed to load hackathons.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Container maxWidth="xl" className="py-8">
        
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <Heading level={1} className="mb-4">🚀 Find Your Next Winning Team</Heading>
          <Text variant="muted" size="lg" className="max-w-2xl mx-auto">
            Join hackathons with developers who match your skills. Discover active teams, connect instantly, and start building.
          </Text>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex flex-col items-center">
              <Text weight="bold" size="xl">150+</Text>
              <Text variant="muted" size="sm">Active Teams</Text>
            </div>
            <div className="w-px h-8 bg-[var(--border-color)]"></div>
            <div className="flex flex-col items-center">
              <Text weight="bold" size="xl">2,400+</Text>
              <Text variant="muted" size="sm">Student Developers</Text>
            </div>
          </div>
        </div>

        <Grid columns={{ base: 1, lg: 12 }} gap={8}>
          
          {/* Main Content: Filters + Cards */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Filters */}
            <div className="flex items-center justify-between gap-4 bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] overflow-x-auto">
              <div className="flex gap-2">
                <Badge variant="primary" className="cursor-pointer">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Online</Badge>
                <Badge variant="outline" className="cursor-pointer">Offline</Badge>
                <Badge variant="outline" className="cursor-pointer">Beginner Friendly</Badge>
              </div>
              <Button variant="ghost" size="sm" icon={<Filter size={16} />}>Filters</Button>
            </div>

            {/* Cards List */}
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {hackathons.map((hackathon) => (
                  <Card key={hackathon._id} interactive onClick={() => navigate(`/hackathons/${hackathon._id}`)}>
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative">
                        <img 
                          src={hackathon.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3'} 
                          alt={hackathon.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="default" className="bg-black/60 text-white backdrop-blur-md border-0">{hackathon.mode}</Badge>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <Heading level={3} className="text-xl">{hackathon.title}</Heading>
                          <Badge variant="success">Excellent Match</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mb-4 mt-2">
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                            <Calendar size={16} className="text-purple-500" />
                            <span>Ends: {new Date(hackathon.registrationDeadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                            <Trophy size={16} className="text-yellow-500" />
                            <span>{hackathon.prizePool}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                            <Users size={16} className="text-blue-500" />
                            <span>{hackathon.participantsCount}+ Joined</span>
                          </div>
                        </div>

                        <div className="mt-auto border-t border-[var(--border-color)] pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <Text size="sm" weight="medium" className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              {hackathon.teamsCount || Math.floor(Math.random() * 50) + 10} Active Teams
                            </Text>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Text size="xs" variant="muted">Looking For:</Text>
                              {(hackathon.lookingFor || ['Frontend', 'Backend', 'AI']).map(role => (
                                <span key={role} className="text-xs bg-[var(--bg-secondary)] px-2 py-0.5 rounded text-[var(--text-secondary)] border border-[var(--border-color)]">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Create Team</Button>
                            <Button variant="primary" size="sm" className="flex-1 sm:flex-none">View Teams</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="p-5">
              <Heading level={4} className="mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-[var(--color-primary)]" />
                Upcoming Deadlines
              </Heading>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <div>
                    <Text weight="medium">SIH 2026 Registration</Text>
                    <Text size="sm" variant="muted">Closes in 3 Days</Text>
                  </div>
                  <Badge variant="error">Urgent</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <Heading level={4} className="mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Your Team
              </Heading>
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <Heading level={5} className="text-indigo-600 dark:text-indigo-400">Tech Titans</Heading>
                    <Badge variant="primary" className="bg-indigo-100 text-indigo-700">3/5</Badge>
                  </div>
                  <Text size="sm" className="mb-3 text-[var(--text-secondary)]">SIH 2026</Text>
                  <Text size="xs" weight="medium" className="mb-2">We need:</Text>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">Frontend</Badge>
                    <Badge variant="outline" className="text-xs">Designer</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <Heading level={4} className="mb-4 flex items-center gap-2">
                <Code size={18} className="text-green-500" />
                Recommended Teams
              </Heading>
              <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer border border-[var(--border-color)] border-transparent hover:border-[var(--border-color)]">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">{i === 1 ? 'A' : 'V'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text weight="medium" className="truncate">{i === 1 ? 'Team Alpha' : 'Visionaries'}</Text>
                      <Text size="xs" variant="muted" className="truncate">Need: AI Engineer</Text>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs text-green-500 font-medium">94% Match</span>
                        <span className="text-[10px] text-[var(--text-muted)]">• Same Timezone</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Grid>
      </Container>
    </Page>
  );
}
