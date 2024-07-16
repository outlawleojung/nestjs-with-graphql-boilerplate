import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { UserValidationService } from '@lib/common';

@Module({
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
