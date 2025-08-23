// Simple endpoint to show event dates clearly
export async function GET() {
  try {
    const response = await fetch('http://localhost:3000/api/events/csv');
    const data = await response.json();
    
    if (!data.events) {
      return new Response('No events found', { status: 404 });
    }
    
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();
    
    let output = `Current Date: ${currentDate} ${currentTime}\n`;
    output += `Current ISO: ${now.toISOString()}\n\n`;
    
    data.events.forEach((event: any, index: number) => {
      const eventDate = new Date(event.date);
      const isValid = !isNaN(eventDate.getTime());
      const isUpcoming = isValid && eventDate >= now;
      
      output += `${index + 1}. ${event.title}\n`;
      output += `   Raw Date: "${event.date}"\n`;
      output += `   Parsed: ${isValid ? eventDate.toLocaleString() : 'INVALID'}\n`;
      output += `   ISO: ${isValid ? eventDate.toISOString() : 'INVALID'}\n`;
      output += `   Is Upcoming: ${isUpcoming}\n`;
      output += `   Days from now: ${isValid ? Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}\n\n`;
    });
    
    return new Response(output, {
      headers: { 'Content-Type': 'text/plain' },
    });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
