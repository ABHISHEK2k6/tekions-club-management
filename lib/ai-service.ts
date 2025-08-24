// AI Service wrapper that handles both real AI and fallback modes
import { allClubs } from '@/lib/mock-data';

// Check if AI is configured
const isAiConfigured = process.env.GOOGLE_GENAI_API_KEY && process.env.GOOGLE_GENAI_API_KEY !== 'your_google_ai_api_key_here';

// Enhanced fallback that can work with database clubs
export const fallbackSuggestClub = async (interest: string, clubs?: any[]) => {
  const clubsToSearch = clubs && clubs.length > 0 ? clubs : allClubs;
  const keywords = interest.toLowerCase();
  
  // Score each club based on keyword matching
  const scoredClubs = clubsToSearch.map(club => {
    let score = 0;
    const clubName = club.name.toLowerCase();
    const clubDescription = (club.description || '').toLowerCase();
    const clubCategory = (club.category || '').toLowerCase();
    const clubTags = club.tags || [];
    
    // Direct name matching
    if (clubName.includes(keywords)) score += 10;
    
    // Description matching
    if (clubDescription.includes(keywords)) score += 8;
    
    // Category matching
    if (clubCategory.includes(keywords)) score += 6;
    
    // Tag matching
    if (clubTags.some((tag: string) => tag.toLowerCase().includes(keywords))) score += 7;
    
    // Keyword-based scoring
    const keywordMatches = [
      { words: ['photo', 'camera', 'picture', 'image'], categories: ['arts', 'media', 'photography'] },
      { words: ['code', 'program', 'software', 'tech', 'computer', 'dev'], categories: ['technology', 'programming', 'computer'] },
      { words: ['game', 'gaming', 'video', 'esports'], categories: ['gaming', 'esports', 'entertainment'] },
      { words: ['music', 'sing', 'instrument', 'band'], categories: ['music', 'performance', 'arts'] },
      { words: ['hike', 'outdoor', 'nature', 'adventure'], categories: ['outdoor', 'sports', 'adventure'] },
      { words: ['art', 'paint', 'draw', 'creative'], categories: ['arts', 'creative', 'visual'] },
      { words: ['act', 'theater', 'drama', 'performance'], categories: ['performance', 'drama', 'theatre'] },
      { words: ['debate', 'speak', 'argument', 'discussion'], categories: ['debate', 'academic', 'communication'] },
      { words: ['environment', 'green', 'sustain', 'eco'], categories: ['environmental', 'sustainability', 'green'] },
      { words: ['business', 'entrepreneur', 'startup', 'finance'], categories: ['business', 'entrepreneurship', 'finance'] },
      { words: ['volunteer', 'service', 'help', 'community'], categories: ['service', 'community', 'volunteer'] },
    ];
    
    for (const match of keywordMatches) {
      if (match.words.some(word => keywords.includes(word))) {
        if (match.categories.some(cat => clubCategory.includes(cat) || clubName.includes(cat))) {
          score += 5;
        }
      }
    }
    
    return { ...club, score };
  });
  
  // Sort by score and get the best match
  scoredClubs.sort((a, b) => b.score - a.score);
  const bestMatch = scoredClubs[0];
  
  const matchScore = Math.min(Math.max(Math.round(bestMatch.score / 2), 1), 10);
  
  return {
    clubName: bestMatch.name,
    clubId: bestMatch.id || 'unknown',
    reason: `Based on your interest in "${interest}", this club seems like a perfect match! ${bestMatch.description ? bestMatch.description.substring(0, 100) + '...' : ''}`,
    matchScore
  };
};

export const fallbackGenerateSuggestion = async (topic: string) => {
  const suggestions = {
    'event': [
      'Host a themed trivia night with prizes for different categories',
      'Organize a collaborative art project where members contribute pieces',
      'Plan a skills-sharing workshop where members teach each other',
      'Host a themed movie marathon with discussion sessions',
      'Organize a friendly competition or tournament related to your club theme'
    ],
    'announcement': [
      'Create eye-catching visuals with key information and benefits',
      'Use storytelling to make your announcement engaging and memorable',
      'Include a clear call-to-action and deadline if applicable',
      'Share success stories or testimonials to build credibility',
      'Use multiple channels - social media, email, and physical posters'
    ],
    'workshop': [
      'Break complex topics into digestible, hands-on modules',
      'Include interactive activities and group exercises',
      'Provide take-home resources and reference materials',
      'Plan for different skill levels with beginner and advanced tracks',
      'End with a practical project that participants can showcase'
    ],
    'meeting': [
      'Start with an icebreaker activity to energize the group',
      'Use the "stand-up" format: what did you do, what will you do, any blockers',
      'Implement the "two pizza rule" - keep meetings small enough that two pizzas can feed everyone',
      'End each meeting with clear action items and assigned owners',
      'Rotate meeting roles to keep everyone engaged and develop leadership skills'
    ],
    'fundraising': [
      'Host a talent show with entry fees and donations',
      'Organize a themed bake sale with creative, Instagram-worthy treats',
      'Plan a service auction where members bid on skills/services',
      'Create and sell club merchandise or custom products',
      'Host a community challenge with sponsorship opportunities'
    ]
  };

  const topic_lower = topic.toLowerCase();
  let suggestion = '';

  for (const [key, suggestions_list] of Object.entries(suggestions)) {
    if (topic_lower.includes(key)) {
      suggestion = suggestions_list[Math.floor(Math.random() * suggestions_list.length)];
      break;
    }
  }

  if (!suggestion) {
    suggestion = `For "${topic}", consider organizing a collaborative activity that brings members together, encourages participation, and aligns with your club's core mission. Focus on creating value for your members while building community.`;
  }

  return { suggestion };
};

export const fallbackSubmitComplaint = async (complaint: string) => {
  // In a real application, you would store the complaint in a database.
  console.log('New anonymous complaint received:', complaint);
  
  return {
    success: true,
    message: "Your complaint has been submitted anonymously. Thank you for your feedback.",
  };
};

// Service functions that use AI when available, fallback when not
export const suggestClubService = async (interest: string) => {
  if (isAiConfigured) {
    try {
      const { suggestClub } = await import('@/lib/ai/flows/suggestClub');
      return await suggestClub({ interest });
    } catch (error) {
      console.warn('AI service failed, using fallback:', error);
      return await fallbackSuggestClub(interest);
    }
  }
  return await fallbackSuggestClub(interest);
};

export const generateSuggestionService = async (topic: string) => {
  if (isAiConfigured) {
    try {
      const { generateSuggestion } = await import('@/lib/ai/flows/generateSuggestion');
      return await generateSuggestion({ topic });
    } catch (error) {
      console.warn('AI service failed, using fallback:', error);
      return await fallbackGenerateSuggestion(topic);
    }
  }
  return await fallbackGenerateSuggestion(topic);
};

export const submitComplaintService = async (complaint: string) => {
  if (isAiConfigured) {
    try {
      const { submitComplaint } = await import('@/lib/ai/flows/submitComplaint');
      return await submitComplaint({ complaint });
    } catch (error) {
      console.warn('AI service failed, using fallback:', error);
      return await fallbackSubmitComplaint(complaint);
    }
  }
  return await fallbackSubmitComplaint(complaint);
};
