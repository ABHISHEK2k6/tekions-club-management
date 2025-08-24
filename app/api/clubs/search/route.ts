import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { query, categories, tags } = await request.json();

    if (!query || typeof query !== 'string') {
      return Response.json(
        { error: 'Search query is required and must be a string' },
        { status: 400 }
      );
    }

    // Build search conditions
    const whereClause: any = {
      isActive: true,
      OR: [
        // Search in club name
        { name: { contains: query, mode: 'insensitive' } },
        // Search in club description
        { description: { contains: query, mode: 'insensitive' } },
        // Search in requirements
        { requirements: { contains: query, mode: 'insensitive' } },
        // Search in meeting schedule
        { meetingSchedule: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Add category filter if provided
    if (categories && Array.isArray(categories) && categories.length > 0) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        category: { in: categories }
      });
    }

    // Add tag filter if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        tags: { hasSome: tags }
      });
    }

    // Search for clubs
    const clubs = await db.club.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: {
              where: {
                isActive: true,
                date: {
                  gte: new Date(),
                }
              }
            },
          },
        },
        events: {
          where: {
            isActive: true,
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
          take: 3,
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
          },
        },
      },
      orderBy: [
        // Prioritize exact name matches
        { name: 'asc' },
        // Then by member count (popularity)
        { members: { _count: 'desc' } },
        // Finally by creation date
        { createdAt: 'desc' },
      ],
      take: 20, // Limit results
    });

    // Calculate relevance scores for each club
    const clubsWithScores = clubs.map(club => {
      let score = 0;
      const queryLower = query.toLowerCase();
      
      // Name match (highest weight)
      if (club.name.toLowerCase().includes(queryLower)) {
        score += 10;
        if (club.name.toLowerCase() === queryLower) score += 5; // Exact match bonus
      }
      
      // Description match
      if (club.description && club.description.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      
      // Tags match
      if (club.tags && club.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        score += 3;
      }
      
      // Category match
      if (club.category.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      
      // Requirements match
      if (club.requirements && club.requirements.toLowerCase().includes(queryLower)) {
        score += 2;
      }
      
      // Popularity bonus (member count)
      score += Math.min(club._count.members * 0.1, 2);
      
      // Active events bonus
      score += Math.min(club._count.events * 0.2, 1);

      return {
        ...club,
        relevanceScore: score,
      };
    });

    // Sort by relevance score
    clubsWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return Response.json({
      clubs: clubsWithScores,
      totalResults: clubsWithScores.length,
      query,
    });
  } catch (error) {
    console.error('Error searching clubs:', error);
    return Response.json(
      { error: 'Failed to search clubs' },
      { status: 500 }
    );
  }
}
