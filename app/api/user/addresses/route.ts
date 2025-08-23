import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' }
    });

    return Response.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { label, street, city, state, zipCode, country, isDefault } = body;

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await db.address.create({
      data: {
        label,
        street,
        city,
        state,
        zipCode,
        country: country || 'US',
        isDefault: isDefault || false,
        userId: session.user.id
      }
    });

    return Response.json({ address });
  } catch (error) {
    console.error('Error creating address:', error);
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
    const { id, label, street, city, state, zipCode, country, isDefault } = body;

    // Verify the address belongs to the user
    const existingAddress = await db.address.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!existingAddress) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await db.address.update({
      where: { id },
      data: {
        label,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault
      }
    });

    return Response.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Address ID is required' }, { status: 400 });
    }

    // Verify the address belongs to the user
    const existingAddress = await db.address.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!existingAddress) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    await db.address.delete({
      where: { id }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
