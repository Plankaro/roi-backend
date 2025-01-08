import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { ConfigService } from '@nestjs/config';
  import { Prisma } from '@prisma/client';
import { Environment,EnvironmentVariable } from 'utils/env.validation';
  
  export const PRISMA_FILTER = 'PRISMA_FILTER' as const;
  
  type PrismaError =
    | Prisma.PrismaClientValidationError
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientUnknownRequestError;
  
  @Catch(
    Prisma.PrismaClientKnownRequestError,
    Prisma.PrismaClientValidationError,
    Prisma.PrismaClientUnknownRequestError,
  )
  export class PrismaClientExceptionFilter implements ExceptionFilter {
    private readonly env: Environment;
    private readonly logger = new Logger(PrismaClientExceptionFilter.name);
  
    constructor(
      private readonly config: ConfigService<EnvironmentVariable, true>,
    ) {
      this.env = this.config.get('NODE_ENV', { infer: true });
    }
  
    catch(exception: PrismaError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();
      this.logger.error(exception);
      if (exception instanceof Prisma.PrismaClientKnownRequestError) {
        const statusCode = exceptionCodes[exception.code] || 400;
        const message =
          this.env === 'production'
            ? exception.meta
            : this.cleanMessage(exception.message);
        response.status(statusCode).json({
          statusCode,
          path: request.url,
          message,
        });
      }
  
      if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
        const statusCode = 500;
        response.status(statusCode).json({
          statusCode,
          path: request.url,
          message: 'Something went wrong',
        });
      }
      if (exception instanceof Prisma.PrismaClientValidationError) {
        const statusCode = 400;
        const indexOfArgument = exception.message.indexOf('Argument');
        const message = this.cleanMessage(
          exception.message.substring(
            indexOfArgument,
            exception.message.length - 1,
          ),
        );
        response.status(statusCode).json({
          statusCode,
          path: request.url,
          message,
        });
      }
    }
  
    private readonly cleanMessage = (message: string) =>
      message.replace(/(\r\n|\r|\n)/g, ' ');
  }
  
  export const exceptionCodes: Record<string, number> = {
    P2000: HttpStatus.OK,
    P2001: HttpStatus.NOT_FOUND,
    P2002: HttpStatus.CONFLICT,
    P2003: HttpStatus.CONFLICT,
    P2004: HttpStatus.CONFLICT,
    P2005: HttpStatus.CONFLICT,
    P2006: HttpStatus.CONFLICT,
    P2007: HttpStatus.FORBIDDEN,
    P2008: HttpStatus.CONFLICT,
    P2010: HttpStatus.BAD_REQUEST,
    P2011: HttpStatus.BAD_REQUEST,
    P2012: HttpStatus.BAD_REQUEST,
    P2013: HttpStatus.BAD_REQUEST,
    P2014: HttpStatus.BAD_REQUEST,
    P2015: HttpStatus.NOT_FOUND,
    P2016: HttpStatus.BAD_REQUEST,
    P2017: HttpStatus.NO_CONTENT,
    P2018: HttpStatus.NOT_FOUND,
    P2019: HttpStatus.BAD_REQUEST,
    P2020: HttpStatus.BAD_REQUEST,
    P2021: HttpStatus.NOT_ACCEPTABLE,
    P2022: HttpStatus.NOT_ACCEPTABLE,
    P2023: HttpStatus.NOT_ACCEPTABLE,
    P2024: HttpStatus.REQUEST_TIMEOUT,
    P2025: HttpStatus.FAILED_DEPENDENCY,
    P2026: HttpStatus.NOT_ACCEPTABLE,
    P2027: HttpStatus.BAD_REQUEST,
    P2028: HttpStatus.NOT_MODIFIED,
    P2030: HttpStatus.BAD_REQUEST,
    P2031: HttpStatus.BAD_REQUEST,
    P2033: HttpStatus.BAD_REQUEST,
    P2034: HttpStatus.CONFLICT,
  };
  