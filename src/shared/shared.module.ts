import { Module } from '@nestjs/common';
import { UtilModule } from './util/util.module';

@Module({
  providers: [],
  exports: [UtilModule],
  imports: [UtilModule],
})
export class SharedModule {}
