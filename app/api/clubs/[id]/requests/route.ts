import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get pending membership requests for a club (owner only) or check user's request status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: clubId } = await params;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

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

    // If userId is provided, check if that user has an active request
    if (userId) {
      if (currentUser.id !== userId) {
        return Response.json(
          { error: 'You can only check your own request status' },
          { status: 403 }
        );
      }

      const activeRequest = await db.membershipRequest.findFirst({
        where: {
          clubId: clubId,
          userId: userId,
          status: 'pending',
        },
      });

      return Response.json({
        hasActiveRequest: !!activeRequest,
        requestId: activeRequest?.id || null,
      });
    }

    // Original functionality - get all pending requests for club owner
    if (club.ownerId !== currentUser.id) {
      return Response.json(
        { error: 'Only club owners can view membership requests' },
        { status: 403 }
      );
    }

    // Get pending membership requests
    const requests = await db.membershipRequest.findMany({
      where: {
        clubId: clubId,
        status: 'pending',
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(requests);
  } catch (error) {
    console.error('Error fetching membership requests:', error);
    return Response.json(
      { error: 'Failed to fetch membership requests' },
      { status: 500 }
    );
  }
}

// POST - Create a membership request
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: clubId } = await params;

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
          clubId: clubId,
          userId: currentUser.id,
        },
      },
    });

    if (existingMembership) {
      return Response.json(
        { error: 'You are already a member of this club' },
        { status: 409 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = await db.membershipRequest.findFirst({
      where: {
        clubId: clubId,
        userId: currentUser.id,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return Response.json(
        { error: 'You already have a pending request for this club' },
        { status: 409 }
      );
    }

    // Create membership request
    const membershipRequest = await db.membershipRequest.create({
      data: {
        clubId: clubId,
        userId: currentUser.id,
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

    return Response.json(membershipRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating membership request:', error);
    return Response.json(
      { error: 'Failed to create membership request' },
      { status: 500 }
    );
  }
}
