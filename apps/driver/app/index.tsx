import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/lib/AuthProvider';
import { COLORS } from '../src/lib/theme';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.black }}>
        <ActivityIndicator color={COLORS.white} />
      </View>
    );
  }

  return <Redirect href={session ? '/(app)' : '/sign-in'} />;
}
