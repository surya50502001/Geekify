export default {
  async fetch(request, env) {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'POST' && new URL(request.url).pathname === '/upload') {
      try {
        const formData = await request.formData();
        const file = formData.get('song');
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file uploaded' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Log upload info (you'll see this in Wrangler logs)
        console.log(`Upload received: ${file.name}, Size: ${file.size} bytes`);
        
        return new Response(JSON.stringify({
          success: true,
          filename: `${Date.now()}-${file.name}`,
          originalName: file.name,
          message: 'Upload logged successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Upload failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Geekify Upload Server Running', { status: 200, headers: corsHeaders });
  }
};