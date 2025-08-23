import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clubId = params.id;
    const body = await request.json();
    const { userEmail, role = 'member' } = body;

    if (!userEmail) {
      return Response.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if current user is the club owner
    const club = await db.club.findUnique({
      where: { id: clubId },
      include: { owner: true },
    });

    if (!club) {
      return Response.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (club.ownerId !== currentUser.id) {
      return Response.json(
        { error: 'Only club owners can add members' },
        { status: 403 }
      );
    }

    // Find the user to add
    const userToAdd = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!userToAdd) {
      return Response.json(
        { error: 'User with this email not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await db.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: clubId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMembership) {
      return Response.json(
        { error: 'User is already a member of this club' },
        { status: 409 }
      );
    }

    // Add the user as a member
    const membership = await db.clubMember.create({
      data: {
        clubId: clubId,
        userId: userToAdd.id,
        role: role,
      },
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
    });

    return Response.json(membership, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return Response.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}
