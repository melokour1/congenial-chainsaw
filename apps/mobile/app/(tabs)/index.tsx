import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../src/lib/ThemeProvider';
import { ScreenContainer, SegmentedControl } from '../../src/components/ui';
import { ValetHomeTab } from '../../src/components/home/ValetHomeTab';
import { RentHomeTab } from '../../src/components/home/RentHomeTab';
import { ForYouHomeTab } from '../../src/components/home/ForYouHomeTab';

type HomeTab = 'valet' | 'rent' | 'for-you';

// Top tabs (Valet | Rent | For You) live within the Home tab, per spec 1.1 —
// default landing is Home > Valet.
export default function HomeScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<HomeTab>('valet');

  return (
    <ScreenContainer edges={['top']}>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: '700', marginBottom: 16 }}>
        LAXValetCare
      </Text>
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: 'valet', label: 'Valet' },
          { value: 'rent', label: 'Rent' },
          { value: 'for-you', label: 'For You' },
        ]}
      />
      <View style={{ marginTop: theme.spacing(5) }}>
        {tab === 'valet' ? <ValetHomeTab /> : tab === 'rent' ? <RentHomeTab /> : <ForYouHomeTab />}
      </View>
    </ScreenContainer>
  );
}
