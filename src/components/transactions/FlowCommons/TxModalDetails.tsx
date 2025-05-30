import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { CheckIcon, ExclamationIcon } from '@heroicons/react/outline';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, FormControlLabel, Skeleton, SvgIcon, Switch, Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { ReactNode, useState } from 'react';
import { CollateralType } from 'src/helpers/types';

import { HealthFactorNumber } from '../../HealthFactorNumber';
import { IncentivesButton } from '../../incentives/IncentivesButton';
import { FormattedNumber, FormattedNumberProps } from '../../primitives/FormattedNumber';
import { Link } from '../../primitives/Link';
import { Row } from '../../primitives/Row';
import { TokenIcon } from '../../primitives/TokenIcon';
import { GasStation } from '../GasStation/GasStation';

export interface TxModalDetailsProps {
  gasLimit?: string;
  slippageSelector?: ReactNode;
  hideGasCalc?: boolean;
  collapsible?: boolean;
}

const ArrowRightIcon = (
  <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
    <ArrowNarrowRightIcon />
  </SvgIcon>
);

export const TxModalDetails: React.FC<TxModalDetailsProps> = ({
  gasLimit,
  slippageSelector,
  children,
  hideGasCalc,
  collapsible,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Box sx={{ pt: 5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ mb: 1 }} color="text.secondary">
          <Trans>Transaction overview</Trans>
        </Typography>

        {collapsible && (
          <CollapsibleButton collapsed={collapsed} onClick={() => setCollapsed(!collapsed)} />
        )}
      </Box>

      {(!collapsible || !collapsed) && (
        <Box
          sx={(theme) => ({
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '4px',
            '.MuiBox-root:last-of-type': {
              mb: 0,
            },
          })}
        >
          {children}
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {!hideGasCalc && <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />}
        {slippageSelector}
      </Box>
    </Box>
  );
};

interface DetailsNumberLineProps extends FormattedNumberProps {
  description: ReactNode;
  value: FormattedNumberProps['value'];
  futureValue?: FormattedNumberProps['value'];
  numberPrefix?: ReactNode;
  iconSymbol?: string;
  loading?: boolean;
}

export const DetailsNumberLine = ({
  description,
  value,
  futureValue,
  numberPrefix,
  iconSymbol,
  loading = false,
  ...rest
}: DetailsNumberLineProps) => {
  return (
    <Row caption={description} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
        ) : (
          <>
            {iconSymbol && <TokenIcon symbol={iconSymbol} sx={{ mr: 1, fontSize: '16px' }} />}
            {numberPrefix && <Typography sx={{ mr: 1 }}>{numberPrefix}</Typography>}
            <FormattedNumber value={value} variant="secondary14" {...rest} />
            {futureValue && (
              <>
                {ArrowRightIcon}
                <FormattedNumber value={futureValue} variant="secondary14" {...rest} />
              </>
            )}
          </>
        )}
      </Box>
    </Row>
  );
};

interface DetailsNumberLineWithSubProps {
  description: ReactNode;
  symbol: ReactNode;
  value?: string;
  valueUSD?: string;
  futureValue: string;
  futureValueUSD: string;
  hideSymbolSuffix?: boolean;
  color?: string;
  tokenIcon?: string;
  loading?: boolean;
}

export const DetailsNumberLineWithSub = ({
  description,
  symbol,
  value,
  valueUSD,
  futureValue,
  futureValueUSD,
  hideSymbolSuffix,
  color,
  tokenIcon,
  loading = false,
}: DetailsNumberLineWithSubProps) => {
  return (
    <Row
      caption={description}
      captionVariant="description"
      mb={4}
      align="flex-start"
      flexWrap={'wrap'}
      gap={'5px'}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          marginLeft: 'auto',
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
            <Skeleton
              variant="rectangular"
              height={15}
              width={80}
              sx={{ borderRadius: '4px', marginTop: '4px' }}
            />
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {value && (
                <>
                  <FormattedNumber value={value} variant="secondary14" color={color} />
                  {!hideSymbolSuffix && (
                    <Typography ml={1} variant="secondary14">
                      {symbol}
                    </Typography>
                  )}
                  {ArrowRightIcon}
                </>
              )}
              {tokenIcon && <TokenIcon symbol={tokenIcon} sx={{ mr: 1, fontSize: '14px' }} />}
              <FormattedNumber value={futureValue} variant="secondary14" color={color} />
              {!hideSymbolSuffix && (
                <Typography ml={1} variant="secondary14">
                  {symbol}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {valueUSD && (
                <>
                  <FormattedNumber value={valueUSD} variant="helperText" compact symbol="USD" />
                  {ArrowRightIcon}
                </>
              )}
              <FormattedNumber value={futureValueUSD} variant="helperText" compact symbol="USD" />
            </Box>
          </>
        )}
      </Box>
    </Row>
  );
};

export interface DetailsCollateralLine {
  collateralType: CollateralType;
}

export const DetailsCollateralLine = ({ collateralType }: DetailsCollateralLine) => {
  return (
    <Row caption={<Trans>Collateralization</Trans>} captionVariant="description" mb={4}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {collateralType === CollateralType.UNAVAILABLE && (
          <>
            <SvgIcon sx={{ color: 'error.main', fontSize: 16, mr: '2px' }}>
              <ExclamationIcon />
            </SvgIcon>
            <Typography variant="description" color="error.main">
              <Trans>Unavailable</Trans>
            </Typography>
          </>
        )}
        {collateralType === CollateralType.ENABLED && (
          <>
            <SvgIcon sx={{ color: 'success.main', fontSize: 16, mr: '2px' }}>
              <CheckIcon />
            </SvgIcon>
            <Typography variant="description" color="success.main">
              <Trans>Enabled</Trans>
            </Typography>
          </>
        )}
        {collateralType === CollateralType.ISOLATED_ENABLED && (
          <>
            <SvgIcon sx={{ color: 'warning.main', fontSize: 16, mr: '2px' }}>
              <CheckIcon />
            </SvgIcon>
            <Typography variant="description" color="warning.main">
              <Trans>Enabled in isolation</Trans>
            </Typography>
          </>
        )}
        {collateralType === CollateralType.DISABLED && (
          <Typography variant="description" color="grey">
            <Trans>Disabled</Trans>
          </Typography>
        )}
        {collateralType === CollateralType.ISOLATED_DISABLED && (
          <Typography variant="description" color="grey">
            <Trans>Disabled</Trans>
          </Typography>
        )}
      </Box>
    </Row>
  );
};

interface DetailsIncentivesLineProps {
  futureIncentives?: ReserveIncentiveResponse[];
  futureSymbol?: string;
  incentives?: ReserveIncentiveResponse[];
  // the token yielding the incentive, not the incentive itself
  symbol: string;
  loading?: boolean;
}

export const DetailsIncentivesLine = ({
  incentives,
  symbol,
  futureIncentives,
  futureSymbol,
  loading = false,
}: DetailsIncentivesLineProps) => {
  if (!incentives || incentives.filter((i) => i.incentiveAPR !== '0').length === 0) return null;
  return (
    <Row caption={<Trans>Rewards APR</Trans>} captionVariant="description" mb={4} minHeight={24}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
        ) : (
          <>
            <IncentivesButton incentives={incentives} symbol={symbol} />
            {futureSymbol && (
              <>
                {ArrowRightIcon}
                <IncentivesButton incentives={futureIncentives} symbol={futureSymbol} />
                {futureIncentives && futureIncentives.length === 0 && (
                  <Typography variant="secondary14">
                    <Trans>None</Trans>
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </Row>
  );
};

export interface DetailsHFLineProps {
  healthFactor: string;
  futureHealthFactor: string;
  visibleHfChange: boolean;
  loading?: boolean;
}

export const DetailsHFLine = ({
  healthFactor,
  futureHealthFactor,
  visibleHfChange,
  loading = false,
}: DetailsHFLineProps) => {
  if (healthFactor === '-1' && futureHealthFactor === '-1') return null;
  return (
    <Row
      caption={<Trans>Health factor</Trans>}
      captionVariant="description"
      mb={4}
      align="flex-start"
    >
      <Box sx={{ textAlign: 'right' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {loading ? (
            <Skeleton variant="rectangular" height={20} width={80} sx={{ borderRadius: '4px' }} />
          ) : (
            <>
              <HealthFactorNumber value={healthFactor} variant="secondary14" />

              {visibleHfChange && (
                <>
                  {ArrowRightIcon}

                  <HealthFactorNumber
                    value={Number(futureHealthFactor) ? futureHealthFactor : healthFactor}
                    variant="secondary14"
                  />
                </>
              )}
            </>
          )}
        </Box>

        <Typography variant="helperText" color="text.secondary">
          <Trans>Liquidation at</Trans>
          {' <1.0'}
        </Typography>
      </Box>
    </Row>
  );
};

export interface DetailsUnwrapSwitchProps {
  unwrapped: boolean;
  setUnWrapped: (value: boolean) => void;
  symbol: string;
  unwrappedSymbol: string;
}

export const DetailsUnwrapSwitch = ({
  unwrapped,
  setUnWrapped,
  symbol,
  unwrappedSymbol,
}: DetailsUnwrapSwitchProps) => {
  return (
    <Row captionVariant="description" mb={4}>
      <FormControlLabel
        value="darkmode"
        control={
          <Switch
            disableRipple
            checked={unwrapped}
            onClick={() => setUnWrapped(!unwrapped)}
            data-cy={'wrappedSwitcher'}
          />
        }
        labelPlacement="end"
        label={''}
      />
      <Typography>{`Unwrap ${symbol} (to withdraw ${unwrappedSymbol})`}</Typography>
    </Row>
  );
};

interface DetailsPSMSwapProps extends FormattedNumberProps {
  description: ReactNode;
  value: FormattedNumberProps['value'];
  iconSymbol: string;
  symbol: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  switchToHandle?: (evt: any) => void;
}

export const DetailsPSMSwap = ({
  value,
  symbol,
  iconSymbol,
  description,
  switchToHandle,
  ...rest
}: DetailsPSMSwapProps) => {
  return (
    <Row caption={description} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormattedNumber value={value} variant="secondary14" {...rest} sx={{ margin: '0 8px' }} />
        <TokenIcon symbol={iconSymbol} sx={{ mr: 1, fontSize: '16px' }} />
        {symbol}
        {switchToHandle && (
          <Box sx={{ paddingLeft: '4px' }}>
            (
            <Link sx={{ fontWeight: 'bold' }} href="#" onClick={switchToHandle}>
              Switch
            </Link>
            )
          </Box>
        )}
      </Box>
    </Row>
  );
};

interface DetailsPSMDepositProps {
  sDAIValue: FormattedNumberProps['value'];
  DAIValue: FormattedNumberProps['value'];
}

export const DetailsPSMDeposit = ({ sDAIValue, DAIValue }: DetailsPSMDepositProps) => {
  return (
    <Row caption={'You receive'} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormattedNumber value={sDAIValue} variant="secondary14" sx={{ margin: '0 8px' }} />
        <TokenIcon symbol="sDAI" sx={{ mr: 1, fontSize: '16px', display: { xs: 'none' } }} />
        sDAI worth{' '}
        <FormattedNumber value={DAIValue} variant="secondary14" sx={{ margin: '0 8px' }} />{' '}
        <TokenIcon symbol="DAI" sx={{ mr: 1, fontSize: '16px', display: { xs: 'none' } }} /> DAI
      </Box>
    </Row>
  );
};

export function CollapsibleButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        minHeight: '28px',
        zIndex: '1',
        pl: 3,
        span: {
          width: '14px',
          height: '2px',
          bgcolor: 'text.secondary',
          position: 'relative',
          ml: 1,
          '&:after': {
            content: "''",
            position: 'absolute',
            width: '14px',
            height: '2px',
            bgcolor: 'text.secondary',
            transition: 'all 0.2s ease',
            transform: collapsed ? 'rotate(90deg)' : 'rotate(0)',
            opacity: collapsed ? 1 : 0,
          },
        },
      }}
      onClick={onClick}
    >
      <Typography variant="buttonM" color="text.secondary">
        {collapsed ? <Trans>Show</Trans> : <Trans>Hide</Trans>}
      </Typography>
      <span />
    </Box>
  );
}
