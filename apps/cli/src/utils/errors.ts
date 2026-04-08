export class CliError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly exitCode: number,
  ) {
    super(message);
    this.name = 'CliError';
  }
}

export const ExitCodes = {
  SUCCESS: 0,
  GENERAL: 1,
  AUTH_REQUIRED: 2,
  INVALID_TOKEN: 3,
  NOT_FOUND: 4,
  VALIDATION_ERROR: 5,
  API_ERROR: 6,
  RATE_LIMITED: 7,
  NETWORK_ERROR: 8,
  ACCESS_RESTRICTED: 9,
} as const;

export function handleError(error: unknown): never {
  if (error instanceof CliError) {
    console.error(error.message);
    process.exit(error.exitCode);
  }

  if (error instanceof Error && 'response' in error) {
    const res = (error as any).response;
    if (res?.status === 401) {
      console.error('Invalid or expired token. Run: clickup auth login');
      process.exit(ExitCodes.INVALID_TOKEN);
    }
    if (res?.status === 404) {
      console.error('Resource not found.');
      process.exit(ExitCodes.NOT_FOUND);
    }
    if (res?.status === 429) {
      console.error('Rate limit reached. Please retry later.');
      process.exit(ExitCodes.RATE_LIMITED);
    }
    console.error(`API error (${res?.status}): ${res?.data?.err || error.message}`);
    process.exit(ExitCodes.API_ERROR);
  }

  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.error(`Network error: ${error.message}`);
      process.exit(ExitCodes.NETWORK_ERROR);
    }
    console.error(error.message);
  } else {
    console.error('Unknown error');
  }
  process.exit(ExitCodes.GENERAL);
}
