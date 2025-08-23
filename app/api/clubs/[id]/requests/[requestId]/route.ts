import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH - Approve or reject a membership request
export async function PATCH(
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
    
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return Response.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
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
    });

    if (!club) {
      return Response.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (club.ownerId !== currentUser.id) {
      return Response.json(
        { error: 'Only club owners can manage membership requests' },
        { status: 403 }
      );
    }

    // Get the membership request
    const membershipRequest = await db.membershipRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!membershipRequest) {
      return Response.json(
        { error: 'Membership request not found' },
        { status: 404 }
      );
    }

    if (membershipRequest.clubId !== clubId) {
      return Response.json(
        { error: 'Membership request does not belong to this club' },
        { status: 400 }
      );
    }

    if (membershipRequest.status !== 'pending') {
      return Response.json(
        { error: 'Membership request has already been processed' },
        { status: 409 }
      );
    }

    // Update the request status
    const updatedRequest = await db.membershipRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date(),
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

    // If approved, create club membership
    if (action === 'approve') {
      await db.clubMember.create({
        data: {
          clubId: clubId,
          userId: membershipRequest.userId,
          role: 'member',
        },
      });
    }

    return Response.json(updatedRequest);
  } catch (error) {
    console.error('Error processing membership request:', error);
    return Response.json(
      { error: 'Failed to process membership request' },
      { status: 500 }
    );
  }
}
