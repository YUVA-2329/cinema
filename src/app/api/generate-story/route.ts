import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pitch, genre } = await request.json();
    if (!pitch) {
      return NextResponse.json({ error: 'Pitch is required' }, { status: 400 });
    }

    const prompt = `You are a Tollywood (Telugu cinema) story writer. Write an engaging, detailed movie story based on the following single-line pitch.
Genre: ${genre}
Pitch: ${pitch}

Structure the story with a title, a catchy logline, an engaging introduction (setting the scene and characters), the conflict/interval bang, and the climax. Write the story in English but keep the authentic flavor and high-emotion drama of Telugu cinema.

Output only the story text.`;

    // Uses Vercel environment variables to prevent GitHub secret scanning blocks
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing. Please add it to your environment variables.' }, { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate story');
    }

    const data = await response.json();
    const generatedStory = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ story: generatedStory });
  } catch (error: any) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
