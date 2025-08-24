import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's clubs with additional information
    const userClubs = await db.clubMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        club: {
          include: {
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
                }
              }
            },
            events: {
              where: {
                isActive: true,
                date: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
              },
              select: {
                title: true,
                date: true,
              },
              orderBy: {
                date: 'desc'
              },
              take: 5
            }
          }
        }
      }
    });

    // Transform the data for the frontend
    const clubs = userClubs.map(membership => ({
      id: membership.club.id,
      name: membership.club.name,
      category: membership.club.category,
      memberCount: membership.club._count.members,
      upcomingEvents: membership.club._count.events,
      recentEvents: membership.club.events.map(event => event.title),
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));

    return Response.json(clubs);

  } catch (error) {
    console.error('Error fetching user clubs:', error);
    return Response.json(
      { error: 'Failed to fetch user clubs' },
      { status: 500 }
    );
  }
}
