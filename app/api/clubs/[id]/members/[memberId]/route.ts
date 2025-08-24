import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: clubId, memberId } = await params;
    const body = await request.json();

    // Check if the user is the club owner
    const club = await db.club.findUnique({
      where: { id: clubId },
      include: {
        owner: {
          select: {
            email: true,
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

    if (club.owner.email !== session.user.email) {
      return Response.json(
        { error: 'Only club owners can manage members' },
        { status: 403 }
      );
    }

    // Check if the membership exists
    const membership = await db.clubMember.findUnique({
      where: { id: memberId },
    });

    if (!membership) {
      return Response.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Validate role
    const validRoles = ['member', 'admin', 'moderator'];
    if (!validRoles.includes(body.role)) {
      return Response.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update the member role
    const updatedMembership = await db.clubMember.update({
      where: { id: memberId },
      data: {
        role: body.role,
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

    return Response.json(updatedMembership);
  } catch (error) {
    console.error('Error updating member role:', error);
    return Response.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: clubId, memberId } = await params;

    // Check if the user is the club owner
    const club = await db.club.findUnique({
      where: { id: clubId },
      include: {
        owner: {
          select: {
            email: true,
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

    if (club.owner.email !== session.user.email) {
      return Response.json(
        { error: 'Only club owners can remove members' },
        { status: 403 }
      );
    }

    // Check if the membership exists
    const membership = await db.clubMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!membership) {
      return Response.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Prevent club owner from removing themselves
    if (membership.user.email === session.user.email) {
      return Response.json(
        { error: 'Club owners cannot remove themselves' },
        { status: 400 }
      );
    }

    // Remove the member
    await db.clubMember.delete({
      where: { id: memberId },
    });

    return Response.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    return Response.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
