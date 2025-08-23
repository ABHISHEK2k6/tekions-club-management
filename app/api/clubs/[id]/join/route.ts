import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

export async function POST(
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

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id: clubId } = await params;

    // Check if club exists
    const club = await db.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return Response.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await db.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return Response.json(
        { error: 'Already a member of this club' },
        { status: 409 }
      );
    }

    // For POST requests, we now only allow direct joins for club owners
    // Regular users should send membership requests instead
    if (club.ownerId !== user.id) {
      return Response.json(
        { error: 'Please send a membership request to join this club. Direct joining is only available to club owners.' },
        { status: 403 }
      );
    }

    // Only club owners can directly join (in case they were removed and want to rejoin)
    await db.clubMember.create({
      data: {
        clubId,
        userId: user.id,
        role: 'admin', // Club owner gets admin role
      },
    });

    return Response.json({ message: 'Successfully joined the club' });
  } catch (error) {
    console.error('Error joining club:', error);
    return Response.json(
      { error: 'Failed to join club' },
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

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id: clubId } = await params;

    // Check if user is a member
    const membership = await db.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return Response.json(
        { error: 'Not a member of this club' },
        { status: 404 }
      );
    }

    // Remove membership
    await db.clubMember.delete({
      where: {
        id: membership.id,
      },
    });

    return Response.json({ message: 'Successfully left the club' });
  } catch (error) {
    console.error('Error leaving club:', error);
    return Response.json(
      { error: 'Failed to leave club' },
      { status: 500 }
    );
  }
}
