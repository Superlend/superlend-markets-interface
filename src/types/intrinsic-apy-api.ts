// TypeScript definitions for the intrinsic APY proxy API

export interface IntrinsicApyApiResponse {
  success: boolean;
  data: {
    mBasisAPY: string;
    mTbillAPY: string;
    stXTZ: string;
    mMEV: string;
  };
  metadata: {
    timestamp: string;
    responseTimeMs: number;
    cached: {
      midas: boolean;
      stacy: boolean;
    };
    errors: {
      midas?: string | null;
      stacy?: string | null;
      api?: string;
    };
  };
}

export interface IntrinsicApyApiErrorResponse {
  success: false;
  error: string;
  message: string;
  data: {
    mBasisAPY: string;
    mTbillAPY: string;
    stXTZ: string;
    mMEV: string;
  };
  metadata: {
    timestamp: string;
    responseTimeMs: number;
    cached: {
      midas: boolean;
      stacy: boolean;
    };
    errors: {
      api: string;
    };
  };
}

export type IntrinsicApyApiResult = IntrinsicApyApiResponse | IntrinsicApyApiErrorResponse;
