// AI Service wrapper that handles both real AI and fallback modes
import { allClubs } from '@/lib/mock-data';

// Check if AI is configured
const isAiConfigured = process.env.GOOGLE_GENAI_API_KEY && process.env.GOOGLE_GENAI_API_KEY !== 'your_google_ai_api_key_here';

// Enhanced fallback that can work with database clubs
export const fallbackSuggestClub = async (interest: string, clubs?: any[]) => {
  const clubsToSearch = clubs && clubs.length > 0 ? clubs : allClubs;
  const keywords = interest.toLowerCase().trim();
  
  // Enhanced keyword-to-category mapping with more comprehensive coverage
  const interestMapping = {
    // Technology & Programming
    'cybersecurity': ['technology', 'security', 'cyber', 'information security', 'ethical hacking'],
    'security': ['technology', 'security', 'cyber', 'information security'],
    'hacking': ['technology', 'security', 'cyber', 'ethical hacking'],
    'programming': ['technology', 'programming', 'coding', 'software', 'development'],
    'coding': ['technology', 'programming', 'coding', 'software', 'development'],
    'software': ['technology', 'programming', 'software', 'development'],
    'tech': ['technology', 'programming', 'software', 'innovation'],
    'ai': ['technology', 'artificial intelligence', 'machine learning', 'data science'],
    'ml': ['technology', 'machine learning', 'data science', 'artificial intelligence'],
    'data science': ['technology', 'data science', 'analytics', 'machine learning'],
    'web dev': ['technology', 'web development', 'programming', 'frontend', 'backend'],
    'mobile': ['technology', 'mobile development', 'app development', 'programming'],
    
    // Business & Entrepreneurship
    'business': ['business', 'entrepreneurship', 'management', 'finance'],
    'entrepreneur': ['entrepreneurship', 'business', 'startup', 'innovation'],
    'startup': ['entrepreneurship', 'business', 'startup', 'innovation'],
    'finance': ['business', 'finance', 'accounting', 'economics'],
    'marketing': ['business', 'marketing', 'digital marketing', 'branding'],
    
    // Arts & Creative
    'photography': ['arts', 'photography', 'visual arts', 'creative'],
    'photo': ['arts', 'photography', 'visual arts'],
    'art': ['arts', 'visual arts', 'creative', 'painting', 'drawing'],
    'music': ['music', 'arts', 'performance', 'creative'],
    'dance': ['arts', 'dance', 'performance', 'cultural'],
    'theater': ['arts', 'theater', 'drama', 'performance'],
    'creative': ['arts', 'creative', 'design', 'innovation'],
    'design': ['arts', 'design', 'creative', 'visual arts'],
    
    // Sports & Fitness
    'sports': ['sports', 'athletics', 'fitness', 'recreation'],
    'fitness': ['sports', 'fitness', 'health', 'wellness'],
    'basketball': ['sports', 'basketball', 'athletics'],
    'football': ['sports', 'football', 'athletics'],
    'cricket': ['sports', 'cricket', 'athletics'],
    'badminton': ['sports', 'badminton', 'athletics'],
    
    // Academic & Professional
    'academic': ['academic', 'education', 'research', 'study'],
    'research': ['academic', 'research', 'innovation', 'science'],
    'ieee': ['technology', 'engineering', 'electronics', 'professional development'],
    'engineering': ['technology', 'engineering', 'innovation', 'academic'],
    
    // Social & Community
    'social service': ['social service', 'community', 'volunteer', 'humanitarian'],
    'volunteer': ['social service', 'community', 'volunteer', 'service'],
    'community': ['community', 'social service', 'cultural', 'volunteer'],
    'cultural': ['cultural', 'arts', 'community', 'heritage'],
    
    // Gaming & Entertainment
    'gaming': ['gaming', 'esports', 'entertainment', 'technology'],
    'esports': ['gaming', 'esports', 'competitive gaming', 'technology'],
    'games': ['gaming', 'entertainment', 'recreation'],
    
    // Others
    'debate': ['academic', 'communication', 'public speaking', 'debate'],
    'environment': ['environmental', 'sustainability', 'green', 'conservation'],
    'leadership': ['leadership', 'professional development', 'management'],
  };

  // Score each club based on advanced matching
  const scoredClubs = clubsToSearch.map(club => {
    let score = 0;
    const clubName = club.name.toLowerCase();
    const clubDescription = (club.description || '').toLowerCase();
    const clubCategory = (club.category || '').toLowerCase();
    const clubTags = club.tags || [];
    
    // Find matching categories for the user's interest
    const matchingCategories = [];
    for (const [key, categories] of Object.entries(interestMapping)) {
      if (keywords.includes(key) || key.includes(keywords)) {
        matchingCategories.push(...categories);
      }
    }
    
    // Also split interest into individual words for broader matching
    const interestWords = keywords.split(/[\s,]+/).filter(word => word.length > 2);
    
    // 1. EXACT INTEREST MATCH (highest priority)
    if (clubName.includes(keywords) || clubDescription.includes(keywords)) {
      score += 50;
    }
    
    // 2. CATEGORY RELEVANCE MATCHING
    for (const category of matchingCategories) {
      if (clubName.includes(category) || clubDescription.includes(category) || clubCategory.includes(category)) {
        score += 30;
      }
    }
    
    // 3. INDIVIDUAL WORD MATCHING
    for (const word of interestWords) {
      if (clubName.includes(word)) score += 15;
      if (clubDescription.includes(word)) score += 10;
      if (clubCategory.includes(word)) score += 12;
      if (clubTags.some((tag: string) => tag.toLowerCase().includes(word))) score += 8;
    }
    
    // 4. SPECIAL TECHNOLOGY MATCHING (for tech-related queries)
    const techKeywords = ['cyber', 'security', 'tech', 'programming', 'coding', 'software', 'ai', 'ml', 'data'];
    const isTechInterest = techKeywords.some(keyword => keywords.includes(keyword));
    const isTechClub = techKeywords.some(keyword => 
      clubName.includes(keyword) || clubDescription.includes(keyword) || clubCategory.includes(keyword)
    );
    
    if (isTechInterest && isTechClub) {
      score += 25;
    }
    
    // 5. PENALIZE COMPLETELY UNRELATED CLUBS
    const isCompletelyUnrelated = (
      (keywords.includes('cyber') || keywords.includes('security')) && 
      (clubName.includes('dance') || clubName.includes('music') || clubCategory.includes('arts'))
    ) || (
      keywords.includes('dance') && 
      (clubName.includes('tech') || clubCategory.includes('technology'))
    );
    
    if (isCompletelyUnrelated) {
      score = Math.max(0, score - 40);
    }
    
    // 6. BOOST FOR EXACT CATEGORY MATCHES
    if (matchingCategories.some(cat => clubCategory === cat)) {
      score += 20;
    }
    
    return { ...club, score, matchingCategories };
  });
  
  // Sort by score and get the best match
  scoredClubs.sort((a, b) => b.score - a.score);
  const bestMatch = scoredClubs[0];
  
  // Calculate match score (1-10) with better scaling
  const matchScore = Math.min(Math.max(Math.round(bestMatch.score / 10), 1), 10);
  
  // Generate more contextual reason
  let reason = `Perfect match for "${interest}"! `;
  if (bestMatch.matchingCategories && bestMatch.matchingCategories.length > 0) {
    reason += `This club aligns with your interest in ${bestMatch.matchingCategories.slice(0, 2).join(' and ')}. `;
  }
  if (bestMatch.description) {
    reason += bestMatch.description.substring(0, 120) + '...';
  }
  
  return {
    clubName: bestMatch.name,
    clubId: bestMatch.id || 'unknown',
    reason,
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
