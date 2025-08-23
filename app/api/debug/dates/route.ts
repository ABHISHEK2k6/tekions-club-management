// Debug endpoint to check date parsing
export async function GET() {
  try {
    const response = await fetch('http://localhost:3000/api/events/csv');
    const data = await response.json();
    
    if (!data.events) {
      return new Response(JSON.stringify({
        error: 'No events data found'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const now = new Date();
    console.log('Current date/time:', now.toISOString());
    
    const dateAnalysis = data.events.map((event: any) => {
      const rawDate = event.date;
      const parsedDate = new Date(rawDate);
      const isValidDate = !isNaN(parsedDate.getTime());
      const isUpcoming = isValidDate && parsedDate >= now;
      
      return {
        title: event.title,
        rawDate: rawDate,
        parsedDate: isValidDate ? parsedDate.toISOString() : 'Invalid Date',
        parsedLocal: isValidDate ? parsedDate.toLocaleString() : 'Invalid Date',
        isValidDate,
        isUpcoming,
        daysDifference: isValidDate ? Math.ceil((parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
      };
    });
    
    return new Response(JSON.stringify({
      currentTime: now.toISOString(),
      currentTimeLocal: now.toLocaleString(),
      events: dateAnalysis
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
