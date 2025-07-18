import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (message.functionCall?.name === 'generate_interview_questions') {
      const { role, level, techstack, type, amount, userid } =
        message.functionCall.parameters;

      // Call your existing API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/vapi/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            level,
            techstack,
            type,
            amount,
            userid,
          }),
        }
      );

      const result = response.ok
        ? 'Interview questions generated successfully!'
        : 'Error generating questions. Please try again.';

      return NextResponse.json({ result });
    }

    return NextResponse.json({ result: 'Function not found' });
  } catch (error) {
    return NextResponse.json({ result: 'Error processing request' });
  }
}
