import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/lib/ThemeProvider';
import { useAuth } from '../../../src/lib/AuthProvider';
import { supabase } from '../../../src/lib/supabase';
import { api, ApiError } from '../../../src/lib/api';
import { ScreenContainer, StepHeader, Button, Input } from '../../../src/components/ui';

interface ChatMessage {
  id: string;
  sender: 'AI' | 'CUSTOMER' | 'ADMIN';
  body: string;
}

export default function AskScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile } = useAuth();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [handedOff, setHandedOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: thread } = await Promise.resolve(
        supabase
          .from('chat_threads')
          .select('id, status')
          .eq('customerId', profile.id)
          .order('lastMessageAt', { ascending: false })
          .limit(1)
          .maybeSingle(),
      );
      if (thread) {
        setThreadId(thread.id);
        setHandedOff(thread.status === 'HUMAN_ACTIVE' || thread.status === 'HUMAN_REQUESTED');
        const { data: history } = await Promise.resolve(
          supabase.from('chat_messages').select('id, sender, body').eq('threadId', thread.id).order('createdAt', { ascending: true }),
        );
        setMessages((history as ChatMessage[]) ?? []);
      }
      setLoading(false);
    })();
  }, [profile]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  async function handleSend() {
    const body = input.trim();
    if (!body || sending) return;
    setError(null);
    setSending(true);
    setInput('');
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, sender: 'CUSTOMER', body }]);

    try {
      const json = await api.post<{ threadId: string; reply: string | null; handedOff?: boolean }>('/api/chat', {
        threadId: threadId ?? undefined,
        body,
      });
      if (!threadId) setThreadId(json.threadId);
      if (json.handedOff) setHandedOff(true);
      if (json.reply) {
        setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, sender: 'AI', body: json.reply! }]);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Message failed to send');
    } finally {
      setSending(false);
    }
  }

  async function handleTalkToHuman() {
    if (!threadId) return;
    setError(null);
    try {
      await api.post('/api/chat/handoff', { threadId });
      setHandedOff(true);
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, sender: 'AI', body: "Connecting... your history has been shared. We'll reply shortly — average response time is ~5 min." },
      ]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not connect you to a human');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenContainer edges={['top', 'bottom']} scroll={false}>
        <StepHeader title="Ask LAXValetCare" onBack={() => router.back()} />
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: -8, marginBottom: 12 }}>
          Chat with our assistant, or ask to talk to a human.
        </Text>

        <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {!loading && messages.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14 }}>
              Ask us anything about pricing, your booking, or rentals — we usually reply in under 5 minutes.
            </Text>
          ) : null}
          <View style={{ gap: 10, paddingBottom: 12 }}>
            {messages.map((m) => (
              <View key={m.id} style={{ alignItems: m.sender === 'CUSTOMER' ? 'flex-end' : 'flex-start' }}>
                <View
                  style={{
                    maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.radii.card,
                    backgroundColor: m.sender === 'CUSTOMER' ? theme.colors.inverseBackground : theme.colors.surfaceAlt,
                  }}
                >
                  <Text
                    style={{
                      color: m.sender === 'CUSTOMER' ? theme.colors.inverseText : theme.colors.text,
                      fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 20,
                    }}
                  >
                    {m.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {error ? (
          <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginBottom: 8 }}>{error}</Text>
        ) : null}

        {!handedOff && threadId ? (
          <Button label="Talk to a human" variant="secondary" size="small" onPress={handleTalkToHuman} fullWidth={false} style={{ marginBottom: 10, alignSelf: 'flex-start' }} />
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', paddingBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Type a message…"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              style={{ marginBottom: 0 }}
            />
          </View>
          <Button label={sending ? '…' : 'Send'} onPress={handleSend} disabled={!input.trim() || sending} loading={sending} fullWidth={false} style={{ marginBottom: 16 }} />
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
