import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';

@Module({
  controllers: [],
  providers: [PostsService],
})
export class AppModule {}