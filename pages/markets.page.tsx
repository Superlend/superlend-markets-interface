import { Container } from '@mui/material';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { MarketAssetsListContainer } from 'src/modules/markets/MarketAssetsListContainer';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';

import AppleFarmBanner from '../src/components/AppleFarmBanner';

export default function Markets() {
  return (
    <>
      <Container style={{ marginTop: '20px' }}>
        <AppleFarmBanner />
      </Container>
      <MarketsTopPanel />
      <ContentContainer>
        <MarketAssetsListContainer />
      </ContentContainer>
    </>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
