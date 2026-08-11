import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../src/lib/ThemeProvider';
import { ScreenContainer, SegmentedControl, Logo } from '../../src/components/ui';
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
      <View style={{ marginBottom: 16 }}>
        <Logo size="md" />
      </View>
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
