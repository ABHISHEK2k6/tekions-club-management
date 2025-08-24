import { db } from '@/lib/db';
import { suggestClub } from '@/lib/ai/flows/suggestClub';
import { fallbackSuggestClub } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const { interest } = await request.json();

    if (!interest || typeof interest !== 'string') {
      return Response.json(
        { error: 'Interest is required and must be a string' },
        { status: 400 }
      );
    }

    // Fetch all active clubs from database with relevant information
    const clubs = await db.club.findMany({
      where: {
        isActive: true,
      },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let suggestion;

    try {
      // Try AI suggestion first
      suggestion = await suggestClub({
        interest,
        clubs,
      });
    } catch (aiError) {
      console.log('AI suggestion failed, using fallback:', aiError);
      // Use enhanced fallback with database clubs
      suggestion = await fallbackSuggestClub(interest, clubs);
    }

    return Response.json(suggestion);
  } catch (error) {
    console.error('Error getting club suggestion:', error);
    return Response.json(
      { error: 'Failed to get club suggestion' },
      { status: 500 }
    );
  }
}
