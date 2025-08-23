export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔍 Test route called with ID:', params.id);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Test route working',
      id: params.id 
    }),
    { 
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
