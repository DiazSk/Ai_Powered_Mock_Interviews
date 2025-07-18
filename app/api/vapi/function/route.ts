import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Function call received from Vapi');

    const body = await request.json();
    console.log('📋 Full request body:', JSON.stringify(body, null, 2));

    const { message } = body;
    console.log('📨 Message object:', message);

    if (message?.functionCall?.name === 'generate_interview_questions') {
      const params = message.functionCall.parameters;
      console.log('🎯 Function parameters:', params);

      const { role, level, techstack, type, amount, userid, userId } = params;

      // Use userid if available, otherwise use userId
      const finalUserId = userid || userId;

      // Validate required parameters
      if (!role || !level || !techstack || !type || !amount || !finalUserId) {
        console.error('❌ Missing required parameters:', {
          role: !!role,
          level: !!level,
          techstack: !!techstack,
          type: !!type,
          amount: !!amount,
          userid: !!userid,
          userId: !!userId,
          finalUserId: !!finalUserId,
        });
        return NextResponse.json({
          result: 'Missing required parameters for interview generation.',
        });
      }

      // Call your existing interview generation API
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        'https://ai-powered-mock-interviews.vercel.app';
      const apiUrl = `${baseUrl}/api/vapi/generate`;

      console.log('📡 Calling API:', apiUrl);
      console.log('📤 API payload:', {
        role,
        level,
        techstack,
        type,
        amount,
        userid: finalUserId,
      });

      const response = await fetch(apiUrl, {
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
          userid: finalUserId,
        }),
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ API Response data:', responseData);
        console.log('🎉 Interview generated successfully!');

        return NextResponse.json({
          result:
            'Interview questions generated successfully! You can now go back to your dashboard to see your new interview.',
        });
      } else {
        const errorData = await response.text();
        console.error('❌ API call failed:', response.status, errorData);
        return NextResponse.json({
          result:
            'Sorry, there was an error generating the interview questions. Please try again.',
        });
      }
    }

    // If no function call or wrong function name
    console.log('❓ No matching function found. Message:', message);
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
    timestamp: new Date().toISOString(),
  });
}
