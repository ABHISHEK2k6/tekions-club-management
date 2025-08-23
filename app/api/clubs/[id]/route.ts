import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: clubId } = await params;

    const club = await db.club.findUnique({
      where: { 
        id: clubId,
        isActive: true 
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                department: true,
                year: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        events: {
          where: {
            isActive: true,
          },
          orderBy: {
            date: 'asc',
          },
          take: 10,
        },
        announcements: {
          where: {
            isActive: true,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            members: true,
            events: true,
            announcements: true,
          },
        },
      },
    });

    if (!club) {
      return Response.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    return Response.json(club);
  } catch (error) {
    console.error('Error fetching club:', error);
    return Response.json(
      { error: 'Failed to fetch club' },
      { status: 500 }
    );
  }
}
