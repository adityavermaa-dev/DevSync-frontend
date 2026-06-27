import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page, Container, Grid } from '@/design-system/layout';
import { Card, Button, Badge, Input, Select, Textarea } from '@/design-system/primitives';
import { Text, Heading } from '@/design-system/typography';
import { MapPin, Users, Calendar, Trophy, Globe, Code, PlusCircle, X } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/constants/commonData';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(store => store.user);
  
  const [hackathon, setHackathon] = useState(null);
  const [problemStatements, setProblemStatements] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('Problem Statements');
  const [loading, setLoading] = useState(true);

  // Create Team Modal State
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [selectedPsId, setSelectedPsId] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', projectIdea: '', estimatedWeeklyHours: 15, preferredCommunication: 'DevSync' });
  const [openPositions, setOpenPositions] = useState([{ role: 'Frontend', skills: '' }]);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/hackathons/${id}`, { withCredentials: true });
      setHackathon(res.data);
      setProblemStatements(res.data.problemStatements || []);

      const teamsRes = await axios.get(`${BASE_URL}/api/teams/hackathon/${id}`, { withCredentials: true });
      setTeams(teamsRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (teamId, role) => {
    try {
      await axios.post(`${BASE_URL}/api/teams/${teamId}/apply`, {
        roleAppliedFor: role,
        message: 'I am interested in this role!'
      }, { withCredentials: true });
      toast.success(`Applied for ${role}! Your profile was attached.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPsId) return toast.error("Please select a problem statement");
    try {
      const formattedPositions = openPositions.map(p => ({
        role: p.role,
        skills: p.skills.split(',').map(s => s.trim()).filter(s => s)
      }));

      const payload = {
        hackathonId: id,
        problemStatementId: selectedPsId,
        name: teamForm.name,
        projectIdea: teamForm.projectIdea,
        openPositions: formattedPositions,
        estimatedWeeklyHours: teamForm.estimatedWeeklyHours,
        preferredCommunication: teamForm.preferredCommunication,
        visibility: 'PUBLIC'
      };

      await axios.post(`${BASE_URL}/api/teams`, payload, { withCredentials: true });
      toast.success("Team Created successfully!");
      setShowCreateTeamModal(false);
      fetchDetails(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const computeMatchScore = (team) => {
    if (!user || !user.skills) return null;
    let score = 0;
    const reasons = [];
    
    const neededRoles = team.openPositions.map(p => p.role.toLowerCase());
    const neededSkills = team.openPositions.flatMap(p => p.skills).map(s => s.toLowerCase());
    
    const userSkills = user.skills.map(s => s.toLowerCase());

    const matchedSkills = neededSkills.filter(s => userSkills.includes(s));
    if (matchedSkills.length > 0) {
      score += matchedSkills.length * 20;
      reasons.push(`✓ Knows ${matchedSkills.slice(0,2).join(', ')}`);
    }

    if (score >= 40) return { match: 'Excellent Match', reasons };
    if (score >= 20) return { match: 'Good Match', reasons };
    return null;
  };

  if (loading || !hackathon) {
    return (
      <Page>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* Header Cover */}
      <div className="w-full h-48 md:h-64 relative bg-gray-900">
        <img src={hackathon.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3'} alt="Cover" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <Container maxWidth="xl" className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row gap-6 items-end justify-between">
          <div className="text-white">
            <Badge variant="primary" className="mb-3">{hackathon.mode}</Badge>
            <Heading level={1} className="text-white mb-2">{hackathon.title}</Heading>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              {hackathon.registrationDeadline && <span className="flex items-center gap-1.5"><Calendar size={16}/> Register by: {new Date(hackathon.registrationDeadline).toLocaleDateString()}</span>}
              {hackathon.prizePool && <span className="flex items-center gap-1.5"><Trophy size={16}/> {hackathon.prizePool}</span>}
              {hackathon.location && <span className="flex items-center gap-1.5"><MapPin size={16}/> {hackathon.location}</span>}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="text-white border-white hover:bg-white/10 flex-1 md:flex-none">Share</Button>
            {hackathon.url && (
              <Button variant="primary" className="flex-1 md:flex-none" onClick={() => window.open(hackathon.url, '_blank')}>
                Register on Official Website
              </Button>
            )}
          </div>
        </Container>
      </div>

      <Container maxWidth="xl" className="py-8">
        <div className="flex overflow-x-auto border-b border-[var(--border-color)] mb-8 hide-scrollbar">
          {['Overview', 'Problem Statements', 'Announcements'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Grid columns={{ base: 1, lg: 12 }} gap={8}>
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {activeTab === 'Overview' && (
              <Card className="p-6">
                <Heading level={3} className="mb-4">About the Hackathon</Heading>
                <Text className="text-[var(--text-secondary)] leading-relaxed mb-6 whitespace-pre-wrap">
                  {hackathon.description}
                </Text>
              </Card>
            )}

            {activeTab === 'Problem Statements' && (
              <div className="flex flex-col gap-6">
                {problemStatements.length === 0 && (
                  <Text variant="muted">No problem statements defined for this hackathon.</Text>
                )}
                {problemStatements.map((ps) => {
                  const psTeams = teams.filter(t => t.problemStatementId === ps._id);
                  
                  return (
                    <div key={ps._id} className="flex flex-col gap-4">
                      <Card className="p-5 border-[var(--color-primary-muted)] bg-[var(--bg-secondary)]">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="secondary" className="mb-2">{ps.domain}</Badge>
                            <Heading level={4} className="mb-1">{ps.title}</Heading>
                            <Text className="text-[var(--text-secondary)]">{ps.description}</Text>
                          </div>
                          <Button size="sm" onClick={() => { setSelectedPsId(ps._id); setShowCreateTeamModal(true); }}>
                            Create Team Here
                          </Button>
                        </div>
                      </Card>
                      
                      {psTeams.length > 0 ? (
                        <div className="pl-4 md:pl-8 flex flex-col gap-4 border-l-2 border-[var(--border-color)]">
                          {psTeams.map(team => {
                            const match = computeMatchScore(team);
                            return (
                              <Card key={team._id} className="p-5">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                  <div>
                                    <Heading level={5} className="mb-1">{team.name}</Heading>
                                    <Text size="sm" className="text-[var(--text-secondary)]">Building: <span className="font-medium text-[var(--text-primary)]">{team.projectId?.title || 'Unknown Idea'}</span></Text>
                                  </div>
                                  {match && (
                                    <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg text-right">
                                      <Text weight="bold" className="text-green-600 dark:text-green-400 text-xs mb-0.5">{match.match}</Text>
                                      {match.reasons.map((r, i) => <Text key={i} size="xs" className="text-green-700 dark:text-green-300">{r}</Text>)}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Text size="xs" weight="medium" className="mb-2 text-[var(--text-muted)] uppercase tracking-wider">Members</Text>
                                    <div className="flex flex-wrap gap-1.5">
                                      {team.members.map((m, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-[var(--bg-tertiary)] text-xs">{m.role}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <Text size="xs" weight="medium" className="mb-2 text-[var(--color-primary)] uppercase tracking-wider">Need</Text>
                                    <div className="flex flex-col gap-2">
                                      {team.openPositions.filter(p => p.filled < p.count).map((pos, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[var(--bg-secondary)] p-2 rounded">
                                          <Text size="sm">{pos.role}</Text>
                                          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleApply(team._id, pos.role)}>Apply</Button>
                                        </div>
                                      ))}
                                      {team.openPositions.filter(p => p.filled < p.count).length === 0 && (
                                        <Text size="sm" variant="muted">Team is full</Text>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="pl-4 md:pl-8 border-l-2 border-[var(--border-color)]">
                          <Text variant="muted" size="sm">No teams have been formed for this problem statement yet. Be the first!</Text>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="p-6 bg-[var(--bg-secondary)]">
              <Heading level={4} className="mb-2">Find your next team!</Heading>
              <Text size="sm" className="mb-4 text-[var(--text-secondary)]">
                Browse problem statements to discover existing teams, or start your own and recruit members.
              </Text>
            </Card>
          </div>
        </Grid>
      </Container>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3}>Create Team</Heading>
              <button onClick={() => setShowCreateTeamModal(false)} className="text-[var(--text-muted)] hover:text-white"><X/></button>
            </div>
            
            <form onSubmit={handleCreateTeamSubmit} className="flex flex-col gap-4">
              <div>
                <Text size="sm" weight="medium" className="mb-1">Team Name</Text>
                <Input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} required placeholder="e.g. Innovators" />
              </div>
              
              <div>
                <Text size="sm" weight="medium" className="mb-1">Project Idea</Text>
                <Textarea value={teamForm.projectIdea} onChange={e => setTeamForm({...teamForm, projectIdea: e.target.value})} required placeholder="Briefly describe what you are building" />
              </div>

              <div>
                <Text size="sm" weight="medium" className="mb-2">Open Positions</Text>
                <div className="flex flex-col gap-3">
                  {openPositions.map((pos, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <Input 
                        placeholder="Role (e.g. Frontend)" 
                        value={pos.role} 
                        onChange={e => {
                          const newPos = [...openPositions];
                          newPos[idx].role = e.target.value;
                          setOpenPositions(newPos);
                        }} 
                        required 
                        className="flex-1"
                      />
                      <Input 
                        placeholder="Skills (comma separated)" 
                        value={pos.skills} 
                        onChange={e => {
                          const newPos = [...openPositions];
                          newPos[idx].skills = e.target.value;
                          setOpenPositions(newPos);
                        }} 
                        className="flex-1"
                      />
                      {idx > 0 && (
                         <button type="button" onClick={() => setOpenPositions(openPositions.filter((_, i) => i !== idx))} className="mt-2 text-red-500"><X size={18}/></button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpenPositions([...openPositions, { role: '', skills: '' }])} className="self-start text-[var(--color-primary)]">
                    <PlusCircle size={16} className="mr-1"/> Add Role
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowCreateTeamModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Team</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Page>
  );
}
