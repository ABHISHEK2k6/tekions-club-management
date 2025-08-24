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
                email: true,
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

export async function PATCH(
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
    const body = await request.json();

    // First, check if the user is the club owner
    const existingClub = await db.club.findUnique({
      where: { id: clubId },
      include: {
        owner: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!existingClub) {
      return Response.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (existingClub.owner.email !== session.user.email) {
      return Response.json(
        { error: 'Only club owners can edit club details' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (body.name && body.name.trim().length < 3) {
      return Response.json(
        { error: 'Club name must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (body.description && body.description.trim().length < 10) {
      return Response.json(
        { error: 'Club description must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Update the club
    const updatedClub = await db.club.update({
      where: { id: clubId },
      data: {
        name: body.name?.trim(),
        description: body.description?.trim(),
        category: body.category,
        isPublic: body.isPublic,
        maxMembers: body.maxMembers,
        tags: body.tags,
        requirements: body.requirements?.trim(),
        meetingSchedule: body.meetingSchedule?.trim(),
        contactEmail: body.contactEmail?.trim(),
        updatedAt: new Date(),
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
        _count: {
          select: {
            members: true,
            events: true,
            announcements: true,
          },
        },
      },
    });

    return Response.json(updatedClub);
  } catch (error) {
    console.error('Error updating club:', error);
    return Response.json(
      { error: 'Failed to update club' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // First, check if the user is the club owner
    const existingClub = await db.club.findUnique({
      where: { id: clubId },
      include: {
        owner: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!existingClub) {
      return Response.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (existingClub.owner.email !== session.user.email) {
      return Response.json(
        { error: 'Only club owners can delete clubs' },
        { status: 403 }
      );
    }

    // Delete the club (this will cascade to related records)
    await db.club.delete({
      where: { id: clubId },
    });

    return Response.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    return Response.json(
      { error: 'Failed to delete club' },
      { status: 500 }
    );
  }
}
