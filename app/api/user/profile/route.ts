import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        clubMemberships: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                category: true,
                logo: true
              }
            }
          }
        },
        eventRegistrations: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                date: true,
                venue: true
              }
            }
          },
          orderBy: { registeredAt: 'desc' },
          take: 10
        },
        ownedClubs: {
          select: {
            id: true,
            name: true,
            category: true,
            logo: true,
            _count: {
              select: { members: true }
            }
          }
        }
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, studentId, department, year, bio } = body;

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        studentId,
        department,
        year,
        bio
      }
    });

    return Response.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
