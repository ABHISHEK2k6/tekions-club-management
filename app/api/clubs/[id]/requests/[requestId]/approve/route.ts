import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: clubId, requestId } = await params;

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

    if (club.owner.email !== session.user.email) {
      return Response.json(
        { error: 'Only club owners can approve membership requests' },
        { status: 403 }
      );
    }

    // Get the membership request
    const membershipRequest = await db.membershipRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!membershipRequest) {
      return Response.json(
        { error: 'Membership request not found' },
        { status: 404 }
      );
    }

    if (membershipRequest.clubId !== clubId) {
      return Response.json(
        { error: 'Request does not belong to this club' },
        { status: 400 }
      );
    }

    if (membershipRequest.status !== 'PENDING') {
      return Response.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Approve the request and add user as member
    await db.$transaction(async (tx) => {
      // Update request status
      await tx.membershipRequest.update({
        where: { id: requestId },
        data: { 
          status: 'approved',
        },
      });

      // Add user as member
      await tx.clubMember.create({
        data: {
          clubId: clubId,
          userId: membershipRequest.userId,
          role: 'member',
        },
      });
    });

    return Response.json({ 
      message: 'Membership request approved successfully',
      approved: true 
    });

  } catch (error) {
    console.error('Error approving membership request:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
