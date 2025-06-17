import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { ReserveFactorTooltip } from 'src/components/infoTooltips/ReserveFactorTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { ExplorerLinkBuilderProps } from 'src/ui-config/networksConfig';

const RANGE_RESERVE_FACTOR_ASSETS = [
  '0x796ea11fa2dd751ed01b53c372ffdb4aaa8f00f9',
  '0x2c03058c8afc06713be23e58d2febc8337dbfe6a',
];

interface ReserveFactorOverviewProps {
  collectorContract: string;
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string;
  reserveFactor: string;
  underlyingAsset: string;
}

export const ReserveFactorOverview = ({
  collectorContract,
  explorerLinkBuilder,
  reserveFactor,
  underlyingAsset,
}: ReserveFactorOverviewProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      <ReserveOverviewBox
        title={
          <ReserveFactorTooltip
            text={<Trans>Reserve factor</Trans>}
            key="res_factor"
            variant="description"
            collectorLink={
              collectorContract
                ? explorerLinkBuilder({
                    address: collectorContract,
                  })
                : undefined
            }
          />
        }
      >
        {RANGE_RESERVE_FACTOR_ASSETS.includes(underlyingAsset.toLowerCase()) ? (
          <Typography variant="secondary14" color="text.secondary">
            15.00% - 25.00%
          </Typography>
        ) : (
          <FormattedNumber
            value={reserveFactor}
            percent
            variant="secondary14"
            visibleDecimals={2}
          />
        )}
      </ReserveOverviewBox>

      <ReserveOverviewBox
        title={
          <Typography variant="description">
            <Trans>Collector Contract</Trans>
          </Typography>
        }
      >
        <Link
          href={explorerLinkBuilder({
            address: collectorContract,
          })}
          sx={{ textDecoration: 'none' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="description" color="text.secondary">
              <Trans>View contract</Trans>
            </Typography>
            <SvgIcon sx={{ ml: 1, fontSize: 14 }}>
              <ExternalLinkIcon />
            </SvgIcon>
          </Box>
        </Link>
      </ReserveOverviewBox>
      {/* TO-DO: Refactor grid layout, currently uses flex: space-around which breaks with 2 elements */}
      <Box
        sx={{
          flex: '0 32%',
          marginBottom: '2%',
          height: { md: '70px', lg: '60px' },
          maxWidth: '32%',
        }}
      />
    </Box>
  );
};
