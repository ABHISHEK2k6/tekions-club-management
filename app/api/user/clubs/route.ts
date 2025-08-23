import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const userId = session.user.id;

    // Fetch user's club memberships with club details
    const memberships = await db.clubMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        club: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    // Transform the data to match the frontend interface
    const clubs = memberships.map((membership) => ({
      id: membership.club.id,
      name: membership.club.name,
      description: membership.club.description,
      logo: membership.club.logo,
      category: membership.club.category,
      isPublic: membership.club.isPublic,
      maxMembers: membership.club.maxMembers,
      tags: membership.club.tags,
      requirements: membership.club.requirements,
      meetingSchedule: membership.club.meetingSchedule,
      contactEmail: membership.club.contactEmail,
      socialLinks: membership.club.socialLinks,
      isActive: membership.club.isActive,
      createdAt: membership.club.createdAt,
      updatedAt: membership.club.updatedAt,
      owner: membership.club.owner,
      _count: {
        members: membership.club._count.members,
      },
      // Include membership-specific data
      membershipRole: membership.role,
      joinedAt: membership.joinedAt,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        clubs: clubs,
        totalJoinedClubs: clubs.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching user clubs:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch clubs' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
