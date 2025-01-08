import { Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  validateSync,
  Matches,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

export class EnvironmentVariable {
  @IsOptional()
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;

  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsUrl({ protocols: ['postgresql'] })
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsUrl({ protocols: ['postgresql'] })
  @IsNotEmpty()
  DATABASE_URL_UNPOOLED: string;

  @IsString()
  @IsNotEmpty()
  SHOPIFY_ACCESS_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  SHOPIFY_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  SHOPIFY_API_SECRET: string;

  @IsString()
  @IsNotEmpty()
  SHOPIFY_STORE: string;

  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL:string;

  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  REDIS_USER: string;
}

export type EnvironmentVariableType = EnvironmentVariable;

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariable, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
