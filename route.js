export async function POST(request) {
  try {
    const { pdf } = await request.json();

    if (!pdf) {
      return Response.json({ error: 'PDF manquant' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Clé API Claude non configurée' }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdf
                }
              },
              {
                type: 'text',
                text: `Analyse ce plan technique de panneau aluminum. 
                
Extrais les dimensions principales du panneau en millimètres:
- Largeur (width)
- Hauteur (height) 
- Profondeur ou épaisseur (depth)

Si tu trouves plusieurs dimensions, utilise les principales du panneau.
Si des dimensions ne sont pas clairement indiquées, estime-les raisonnablement.

Réponds UNIQUEMENT en JSON valide, sans markdown ou backticks:
{"width": nombre, "height": nombre, "depth": nombre, "description": "courte description"}

Exemple: {"width": 500, "height": 300, "depth": 50, "description": "panneau facade avant"}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: data.error?.message || 'Erreur API Claude' 
      }, { status: 500 });
    }

    const text = data.content[0].text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const dimensions = JSON.parse(cleaned);

    // Validation basique
    if (!dimensions.width || !dimensions.height || !dimensions.depth) {
      return Response.json({ 
        error: 'Dimensions invalides extraites du PDF' 
      }, { status: 400 });
    }

    return Response.json({ dimensions });

  } catch (error) {
    console.error('Erreur:', error);
    return Response.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}
