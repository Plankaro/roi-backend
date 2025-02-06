import { Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsEmail,
  validateSync,
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
  CLIENT_URL: string;

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

  @IsUrl() // Use IsUrl if the REDIS_URL follows a URL pattern, otherwise use IsString.
  @IsNotEmpty()
  REDIS_URL: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  REDIS_USER: string;

  @IsString()
  @IsNotEmpty()
  WHATSAPP_MOBILE_ID: string; // Treat as string since it might be too long for a number

  @IsString()
  @IsNotEmpty()
  WHATSAPP_API_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  WHATSAPP_BUISNESS_ID: string;

  @IsString()
  @IsNotEmpty()
  SENDGRID_API_KEY: string;

  @IsEmail()
  @IsNotEmpty()
  SENDER_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_SECRET: string;

  @IsUrl() // Assuming CLOUDINARY_URL is a valid URL
  @IsNotEmpty()
  CLOUDINARY_URL: string;
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
