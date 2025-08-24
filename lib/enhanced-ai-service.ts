// Enhanced AI Service with real database integration and advanced matching
import { db } from '@/lib/db';

// Check if AI is configured
const isAiConfigured = process.env.GOOGLE_GENAI_API_KEY && process.env.GOOGLE_GENAI_API_KEY !== 'your_google_ai_api_key_here';

interface ClubSuggestionInput {
  interest: string;
  preferredCategories?: string[];
  userId?: string;
}

interface ClubSuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  tags: string[];
  memberCount: number;
  upcomingEvents: number;
  owner: {
    name: string;
    image?: string;
  };
  matchScore: number;
  reason: string;
  meetingSchedule?: string;
  isPublic: boolean;
}

interface EventSuggestionInput {
  clubId: string;
  clubInfo?: any;
  eventType: string;
  customGoals?: string;
  userId?: string;
}

interface EventSuggestion {
  id: string;
  title: string;
  description: string;
  suggestedDate: string;
  estimatedDuration: string;
  venue: string;
  expectedParticipants: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  tags: string[];
  materials: string[];
  budget: {
    min: number;
    max: number;
  };
  successTips: string[];
  relatedSkills: string[];
  aiReasoning: string;
  matchScore: number;
}

// Enhanced club suggestion with database integration
export const enhancedSuggestClubService = async (input: ClubSuggestionInput) => {
  try {
    // Fetch all active clubs from database with additional info
    const clubs = await db.club.findMany({
      where: {
        isActive: true,
        ...(input.preferredCategories?.length ? {
          category: { in: input.preferredCategories }
        } : {})
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        members: {
          select: {
            id: true,
            userId: true,
          }
        },
        events: {
          where: {
            isActive: true,
            date: {
              gte: new Date(),
            }
          },
          select: {
            id: true,
          }
        },
        _count: {
          select: {
            members: true,
            events: true,
          }
        }
      },
      orderBy: [
        { members: { _count: 'desc' } },
        { createdAt: 'desc' }
      ]
    });

    if (clubs.length === 0) {
      return { clubs: [] };
    }

    // Enhanced matching algorithm
    const suggestedClubs = clubs.map(club => {
      const matchScore = calculateClubMatchScore(input.interest, club, input.preferredCategories);
      const reason = generateClubReason(input.interest, club, matchScore);

      return {
        id: club.id,
        name: club.name,
        description: club.description || 'Join us for exciting activities and community!',
        category: club.category,
        logo: club.logo,
        tags: club.tags,
        memberCount: club._count.members,
        upcomingEvents: club._count.events,
        owner: {
          name: club.owner.name || 'Club Admin',
          image: club.owner.image,
        },
        matchScore,
        reason,
        meetingSchedule: club.meetingSchedule,
        isPublic: club.isPublic,
      };
    })
    .filter(club => club.matchScore > 20) // Only show clubs with decent match
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Top 5 suggestions

    // Use AI if available for enhanced reasoning
    if (isAiConfigured && suggestedClubs.length > 0) {
      try {
        const { suggestClub } = await import('@/lib/ai/flows/suggestClub');
        // Enhanced reasoning using existing AI service
        for (let i = 0; i < suggestedClubs.length; i++) {
          try {
            const aiResult = await suggestClub({ 
              interest: `${input.interest} with focus on ${suggestedClubs[i].category}` 
            });
            if (aiResult?.reason) {
              suggestedClubs[i].reason = aiResult.reason;
            }
          } catch (err) {
            console.warn(`AI enhancement failed for club ${i}:`, err);
          }
        }
      } catch (error) {
        console.warn('AI enhancement failed, using fallback reasoning:', error);
      }
    }

    return { clubs: suggestedClubs };

  } catch (error) {
    console.error('Error in enhanced club suggestion:', error);
    throw new Error('Failed to generate club suggestions');
  }
};

// Enhanced event suggestion service
export const enhancedEventSuggestionService = async (input: EventSuggestionInput) => {
  try {
    // Fetch club details and recent events
    const club = await db.club.findUnique({
      where: { id: input.clubId },
      include: {
        members: { select: { id: true } },
        events: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          },
          select: {
            title: true,
            description: true,
            date: true,
          },
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!club) {
      throw new Error('Club not found');
    }

    // Generate base event suggestions
    const baseEventSuggestions = generateEventSuggestions(
      input.eventType,
      club,
      input.customGoals
    );

    // Use AI if available for enhanced suggestions
    if (isAiConfigured) {
      try {
        const { generateSuggestion } = await import('@/lib/ai/flows/generateSuggestion');
        // Enhanced event reasoning using existing AI service
        for (let i = 0; i < baseEventSuggestions.length; i++) {
          try {
            const aiResult = await generateSuggestion({ 
              topic: `${input.eventType} event for ${club.name} (${club.category}) ${input.customGoals ? 'with goals: ' + input.customGoals : ''}` 
            });
            if (aiResult?.suggestion) {
              baseEventSuggestions[i].aiReasoning = aiResult.suggestion;
            }
          } catch (err) {
            console.warn(`AI enhancement failed for event ${i}:`, err);
          }
        }
      } catch (error) {
        console.warn('AI event enhancement failed, using fallback:', error);
      }
    }

    return { suggestions: baseEventSuggestions };

  } catch (error) {
    console.error('Error in enhanced event suggestion:', error);
    throw new Error('Failed to generate event suggestions');
  }
};

// Helper function to calculate club match score
function calculateClubMatchScore(
  interest: string, 
  club: any, 
  preferredCategories?: string[]
): number {
  let score = 0;
  const interestLower = interest.toLowerCase();
  
  // Category match (30 points)
  if (preferredCategories?.includes(club.category)) {
    score += 30;
  }
  
  // Name match (25 points)
  if (club.name.toLowerCase().includes(interestLower)) {
    score += 25;
  }
  
  // Description match (20 points)
  if (club.description?.toLowerCase().includes(interestLower)) {
    score += 20;
  }
  
  // Tags match (20 points total)
  const matchingTags = club.tags.filter((tag: string) => 
    tag.toLowerCase().includes(interestLower) || 
    interestLower.includes(tag.toLowerCase())
  );
  score += Math.min(matchingTags.length * 5, 20);
  
  // Activity level bonus (5 points)
  if (club._count?.events > 0) {
    score += 5;
  }
  
  // Keyword matching for specific interests
  const keywords = extractKeywords(interestLower);
  const clubText = `${club.name} ${club.description} ${club.tags.join(' ')}`.toLowerCase();
  
  keywords.forEach(keyword => {
    if (clubText.includes(keyword)) {
      score += 3;
    }
  });
  
  return Math.min(score, 100); // Cap at 100%
}

// Helper function to generate club suggestion reason
function generateClubReason(interest: string, club: any, matchScore: number): string {
  const reasons = [];
  
  if (matchScore >= 80) {
    reasons.push(`Perfect match! This club aligns excellently with your interest in "${interest}".`);
  } else if (matchScore >= 60) {
    reasons.push(`Great fit! This club offers activities related to "${interest}".`);
  } else {
    reasons.push(`Good opportunity to explore "${interest}" in a new way.`);
  }
  
  if (club._count?.members > 20) {
    reasons.push('Active community with engaged members.');
  }
  
  if (club._count?.events > 0) {
    reasons.push('Regular events and activities to participate in.');
  }
  
  if (club.tags.length > 3) {
    reasons.push('Diverse range of topics and activities.');
  }
  
  return reasons.join(' ');
}

// Helper function to extract keywords from interest
function extractKeywords(interest: string): string[] {
  const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return interest
    .split(/[\s,]+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => word.toLowerCase());
}

// Helper function to generate base event suggestions
function generateEventSuggestions(
  eventType: string,
  club: any,
  customGoals?: string
): EventSuggestion[] {
  const eventTemplates = getEventTemplates();
  const baseTemplate = eventTemplates[eventType] || eventTemplates['Workshop'];
  
  // Generate 2-3 variations based on club context
  const suggestions: EventSuggestion[] = [];
  
  for (let i = 0; i < 2; i++) {
    const suggestion: EventSuggestion = {
      id: `suggestion-${Date.now()}-${i}`,
      title: generateEventTitle(eventType, club.category, club.name, i),
      description: generateEventDescription(eventType, club, i, customGoals),
      suggestedDate: getSuggestedDate(i),
      estimatedDuration: baseTemplate.duration,
      venue: baseTemplate.venue,
      expectedParticipants: Math.min(Math.floor(club.members.length * 0.7), baseTemplate.maxParticipants),
      difficulty: baseTemplate.difficulty,
      category: club.category,
      tags: [...baseTemplate.tags, ...club.tags.slice(0, 2)],
      materials: baseTemplate.materials,
      budget: baseTemplate.budget,
      successTips: baseTemplate.successTips,
      relatedSkills: baseTemplate.relatedSkills,
      aiReasoning: generateAiReasoning(eventType, club, customGoals),
      matchScore: calculateEventMatchScore(eventType, club, customGoals)
    };
    
    suggestions.push(suggestion);
  }
  
  return suggestions;
}

// Event templates for different types
function getEventTemplates(): Record<string, any> {
  return {
    'Workshop': {
      duration: '2-3 hours',
      venue: 'Club meeting room or classroom',
      maxParticipants: 30,
      difficulty: 'Intermediate' as const,
      tags: ['hands-on', 'learning', 'interactive'],
      materials: ['Laptops/tablets', 'Presentation materials', 'Handouts'],
      budget: { min: 50, max: 200 },
      successTips: [
        'Prepare interactive exercises to keep participants engaged',
        'Provide take-home resources for continued learning',
        'Include time for Q&A and networking'
      ],
      relatedSkills: ['Problem-solving', 'Communication', 'Technical skills']
    },
    'Competition': {
      duration: '4-6 hours',
      venue: 'Large auditorium or event hall',
      maxParticipants: 100,
      difficulty: 'Advanced' as const,
      tags: ['competitive', 'showcase', 'prizes'],
      materials: ['Judging materials', 'Prizes', 'Registration system'],
      budget: { min: 200, max: 500 },
      successTips: [
        'Set clear rules and judging criteria',
        'Promote well in advance to build excitement',
        'Secure meaningful prizes or recognition'
      ],
      relatedSkills: ['Strategic thinking', 'Performance under pressure', 'Teamwork']
    },
    'Social Event': {
      duration: '2-4 hours',
      venue: 'Student lounge or outdoor space',
      maxParticipants: 50,
      difficulty: 'Beginner' as const,
      tags: ['networking', 'fun', 'community'],
      materials: ['Refreshments', 'Games/activities', 'Music system'],
      budget: { min: 100, max: 300 },
      successTips: [
        'Plan icebreaker activities for new members',
        'Create a welcoming atmosphere for all skill levels',
        'Include opportunities for members to connect'
      ],
      relatedSkills: ['Social skills', 'Leadership', 'Event planning']
    }
    // Add more templates as needed
  };
}

// Helper functions for event generation
function generateEventTitle(eventType: string, category: string, clubName: string, variation: number): string {
  const titleTemplates = {
    'Workshop': [
      `${category} Innovation Workshop`,
      `Hands-on ${category} Masterclass`,
      `${category} Skills Bootcamp`
    ],
    'Competition': [
      `${clubName} Challenge Championship`,
      `${category} Innovation Contest`,
      `Battle of ${category} Masters`
    ],
    'Social Event': [
      `${clubName} Community Mixer`,
      `${category} Enthusiasts Meetup`,
      `${clubName} Social Hour`
    ]
  };
  
  const templates = titleTemplates[eventType] || titleTemplates['Workshop'];
  return templates[variation] || templates[0];
}

function generateEventDescription(eventType: string, club: any, variation: number, customGoals?: string): string {
  const goalText = customGoals ? ` focusing on ${customGoals}` : '';
  
  const descriptions = {
    'Workshop': [
      `Join us for an interactive ${club.category.toLowerCase()} workshop${goalText}. Perfect for both beginners and experienced members looking to expand their skills.`,
      `Dive deep into ${club.category.toLowerCase()} concepts through hands-on activities${goalText}. This workshop will challenge your thinking and expand your horizons.`
    ],
    'Competition': [
      `Test your ${club.category.toLowerCase()} skills in our exciting competition${goalText}. Compete individually or in teams for amazing prizes and recognition.`,
      `Showcase your talent in this thrilling ${club.category.toLowerCase()} challenge${goalText}. Open to all skill levels with multiple competition categories.`
    ],
    'Social Event': [
      `Connect with fellow ${club.category.toLowerCase()} enthusiasts in a relaxed, fun environment${goalText}. Great for networking and making new friends.`,
      `Celebrate our community with games, activities, and great conversation${goalText}. Everyone is welcome to join this inclusive social gathering.`
    ]
  };
  
  const eventDescriptions = descriptions[eventType] || descriptions['Workshop'];
  return eventDescriptions[variation] || eventDescriptions[0];
}

function getSuggestedDate(variation: number): string {
  const date = new Date();
  date.setDate(date.getDate() + (variation + 1) * 14); // 2 weeks, 4 weeks ahead
  return date.toLocaleDateString();
}

function generateAiReasoning(eventType: string, club: any, customGoals?: string): string {
  const memberCount = club.members?.length || 0;
  const recentEvents = club.events?.length || 0;
  
  let reasoning = `Based on ${club.name}'s ${club.category.toLowerCase()} focus and ${memberCount} active members, `;
  
  if (recentEvents > 0) {
    reasoning += `this ${eventType.toLowerCase()} builds on your recent activity momentum. `;
  } else {
    reasoning += `this ${eventType.toLowerCase()} is perfect to kickstart club engagement. `;
  }
  
  if (customGoals) {
    reasoning += `The format aligns well with your goal of ${customGoals.toLowerCase()}. `;
  }
  
  reasoning += `This event type typically sees high participation and creates lasting value for members.`;
  
  return reasoning;
}

function calculateEventMatchScore(eventType: string, club: any, customGoals?: string): number {
  let score = 70; // Base score
  
  // Adjust based on club activity
  if (club.events?.length > 0) score += 10;
  if (club.members?.length > 20) score += 10;
  if (customGoals) score += 5;
  if (club.tags?.length > 3) score += 5;
  
  return Math.min(score, 100);
}
