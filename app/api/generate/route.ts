import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface StageNameRequest {
  artistLook: string;
  musicStyle: string;
  culturalChoices: string;
}

interface StageName {
  name: string;
  culturalOrigin: string;
  midjourneyPrompt: string;
}

interface GenerateResponse {
  stageNames: StageName[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: StageNameRequest = await request.json();
    const { artistLook, musicStyle, culturalChoices } = body;

    // Validate inputs
    if (!artistLook || !musicStyle || !culturalChoices) {
      return NextResponse.json(
        { error: 'Missing required fields: artistLook, musicStyle, culturalChoices' },
        { status: 400 }
      );
    }

    // System prompt for the LLM
    const systemPrompt = `You are a high-end Music Creative Director with expertise in brand development, cultural sensitivity, and artist positioning. Your role is to create memorable, brandable stage names that resonate with contemporary music audiences.

You must respond ONLY with valid JSON in the following format - no additional text:
{
  "stageNames": [
    {
      "name": "stage name here",
      "culturalOrigin": "cultural/linguistic origin",
      "midjourneyPrompt": "detailed Midjourney prompt for Spotify profile art"
    }
  ]
}

Requirements:
- Generate exactly 4 unique, brandable stage names
- Each name must be memorable, marketable, and suitable for streaming platforms
- Each name must have authentic cultural or linguistic origins (specify them)
- Each Midjourney prompt must be 15-25 words, highly detailed, and capture the artist's essence for Spotify profile artwork
- Ensure cultural authenticity and avoid appropriation
- Consider market appeal and discoverability
- Make each name distinct in style and appeal`;

    const userPrompt = `Create 4 brandable stage names for an artist with these characteristics:
- Artist Look: ${artistLook}
- Music Style: ${musicStyle}
- Cultural Choices: ${culturalChoices}

Generate names that are unique, memorable, and suitable for streaming platforms.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate stage names' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    // Parse the JSON response from OpenAI
    let parsedResponse: GenerateResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      console.error('Failed to parse OpenAI response:', content);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (
      !parsedResponse.stageNames ||
      !Array.isArray(parsedResponse.stageNames) ||
      parsedResponse.stageNames.length !== 4
    ) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error('Error generating stage names:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
