'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.action';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      console.log('📩 Message received:', message);

      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };
        console.log('💬 Final transcript:', newMessage);
        setMessages(prev => [...prev, newMessage]);
      }

      // Log function calls
      if (message.type === 'function-call') {
        console.log('🔧 Function call detected:', message);
      }

      if (message.type === 'function-call-result') {
        console.log('✅ Function call result:', message);
      }

      if (message.type === 'tool-calls') {
        console.log('🛠️ Tool calls:', message);
      }
    };

    const onSpeechStart = () => {
      console.log('🎤 Speech start - AI is speaking');
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log('🎤 Speech end - AI finished speaking');
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log('❌ Vapi Error:', error);
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log('🔍 handleGenerateFeedback');

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log('❌ Error saving feedback');
        router.push('/');
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === 'generate') {
        router.push('/');
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    try {
      console.log('🚀 handleCall triggered');
      console.log('📋 Type:', type);
      console.log('👤 User:', userName, 'ID:', userId);

      setCallStatus(CallStatus.CONNECTING);

      if (type === 'generate') {
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!;
        console.log('🤖 Starting assistant with ID:', assistantId);

        if (!assistantId) {
          throw new Error('NEXT_PUBLIC_VAPI_ASSISTANT_ID is not set');
        }

        // Pass user ID as a variable
        await vapi.start(assistantId, {
          variableValues: {
            userid: userId,
            username: userName,
          },
        });

        console.log('✅ Assistant started successfully');
      } else {
        let formattedQuestions = '';
        if (questions) {
          formattedQuestions = questions
            .map(question => `- ${question}`)
            .join('\n');
        }

        console.log('🎯 Starting interview with:', {
          questionsCount: questions?.length,
          formattedQuestions: formattedQuestions.substring(0, 100) + '...',
        });

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }

      console.log('✅ Vapi.start completed successfully');
    } catch (error) {
      console.error('💥 Error in handleCall:', error);
      setCallStatus(CallStatus.INACTIVE);
      alert(`Failed to start interview: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                'transition-opacity duration-500 opacity-0',
                'animate-fadeIn opacity-100'
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== 'ACTIVE' ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                'absolute animate-ping rounded-full opacity-75',
                callStatus !== 'CONNECTING' && 'hidden'
              )}
            />

            <span className="relative">
              {callStatus === 'INACTIVE' || callStatus === 'FINISHED'
                ? 'Call'
                : '. . .'}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
