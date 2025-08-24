import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    const whereClause: any = {
      isActive: true,
    };

    if (clubId) {
      whereClause.clubId = clubId;
    }

    const events = await db.event.findMany({
      where: whereClause,
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return Response.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const eventData = await request.json();
    const {
      title,
      description,
      date,
      endDate,
      venue,
      maxParticipants,
      clubId,
      category,
      registrationLink,
    } = eventData;

    // Validate required fields
    if (!title || !date || !venue || !clubId) {
      return Response.json(
        { error: 'Missing required fields: title, date, venue, and clubId are required' },
        { status: 400 }
      );
    }

    // Check if user is owner or admin of the club
    const club = await db.club.findUnique({
      where: { id: clubId },
      include: {
        members: {
          where: {
            userId: user.id,
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

    // Check if user has permission to create events for this club
    const isOwner = club.ownerId === user.id;
    const isAdmin = club.members.some(member => 
      member.userId === user.id && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return Response.json(
        { error: 'You do not have permission to create events for this club' },
        { status: 403 }
      );
    }

    // Create the event
    const newEvent = await db.event.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        venue,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        category: category || null,
        registrationLink: registrationLink || null,
        clubId,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return Response.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
