import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    description: 'Health check endpoint',
  })
  @ApiOkResponse({
    description: 'Health check response',
    schema: {
      type: 'string',
      example: 'Server is healthy',
    },
  })
  health(): string {
    return this.appService.checkHealthy();
  }
}
