import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const whereClause: any = {
      isActive: true,
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

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
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
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
        },
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return Response.json(
      { error: 'Failed to fetch clubs' },
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

    const body = await request.json();
    const {
      name,
      description,
      category,
      isPublic = true,
      maxMembers,
      tags = [],
      requirements,
      meetingSchedule,
      contactEmail,
      socialLinks,
      logo,
    } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return Response.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Check if club name already exists
    const existingClub = await db.club.findUnique({
      where: { name },
    });

    if (existingClub) {
      return Response.json(
        { error: 'A club with this name already exists' },
        { status: 409 }
      );
    }

    // Create the club (using available fields for now)
    const club = await db.club.create({
      data: {
        name,
        description,
        category,
        logo,
        ownerId: user.id,
        // Note: Additional fields will be added after schema migration
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
            events: true,
          },
        },
      },
    });

    // Automatically add the creator as a member with admin role
    await db.clubMember.create({
      data: {
        clubId: club.id,
        userId: user.id,
        role: 'admin',
      },
    });

    return Response.json(club, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return Response.json(
      { error: 'Failed to create club' },
      { status: 500 }
    );
  }
}
