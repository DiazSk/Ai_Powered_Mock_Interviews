import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Function call received');

    const body = await request.json();
    console.log('📋 Function call body:', body);

    const { message } = body;

    if (message?.functionCall?.name === 'generate_interview_questions') {
      const params = message.functionCall.parameters;
      console.log('🎯 Function parameters:', params);

      const { role, level, techstack, type, amount, userid } = params;

      // Call your existing interview generation API
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/vapi/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          level,
          techstack,
          type,
          amount,
          userid,
        }),
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        console.log('✅ Interview generated successfully');
        return NextResponse.json({
          result:
            'Interview questions generated successfully! You can now go back to your dashboard to see your new interview.',
        });
      } else {
        console.error('❌ API call failed:', response.status);
        return NextResponse.json({
          result:
            'Sorry, there was an error generating the interview questions. Please try again.',
        });
      }
    }

    // If no function call or wrong function name
    console.log('❓ No matching function found');
    return NextResponse.json({
      result: 'Function not recognized',
    });
  } catch (error) {
    console.error('💥 Function call error:', error);
    return NextResponse.json({
      result: 'Error processing function call',
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Vapi function handler is working',
  });
}
