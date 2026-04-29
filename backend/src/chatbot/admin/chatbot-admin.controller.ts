import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt_strategy/jwt-auth.guard';
import { Roles } from '../../auth/roles/roles.decorator';
import { RolesGuard } from '../../auth/roles/roles.guard';
import { RoleName } from '../../common/types/role-name.enum';
import { ChatbotAdminService } from './chatbot-admin.service';
import { ChatbotMetricsQueryDto } from './dto/chatbot-metrics-query.dto';
import { ListKnowledgeQueryDto } from './dto/list-knowledge-query.dto';
import { CreateKnowledgeItemDto } from './dto/create-knowledge-item.dto';
import { UpdateKnowledgeItemDto } from './dto/update-knowledge-item.dto';
import { CreateIntentDto } from './dto/create-intent.dto';
import { UpdateIntentDto } from './dto/update-intent.dto';
import { CreateIntentPhraseDto } from './dto/create-intent-phrase.dto';
import { UpdateIntentPhraseDto } from './dto/update-intent-phrase.dto';
import { ListUnresolvedQueryDto } from './dto/list-unresolved-query.dto';
import { UpdateChatbotConfigDto } from './dto/chatbot-config.dto';

type RequestWithUser = {
  user: {
    id: number;
  };
};

@Controller('admin/chatbot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class ChatbotAdminController {
  constructor(private readonly service: ChatbotAdminService) {}

  @Get('metrics')
  getMetrics(@Query() query: ChatbotMetricsQueryDto) {
    return this.service.getMetrics(query);
  }

  @Get('unresolved')
  listUnresolved(@Query() query: ListUnresolvedQueryDto) {
    return this.service.listUnresolved(query);
  }

  @Patch('unresolved/:id/resolve')
  resolveUnresolved(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestWithUser,
  ) {
    return this.service.resolveUnresolved(id, request.user.id);
  }

  @Patch('unresolved/:id/reopen')
  reopenUnresolved(@Param('id', ParseIntPipe) id: number) {
    return this.service.reopenUnresolved(id);
  }

  @Delete('unresolved/:id')
  deleteUnresolved(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteUnresolved(id);
  }

  @Get('knowledge-items')
  listKnowledge(@Query() query: ListKnowledgeQueryDto) {
    return this.service.listKnowledgeItems(query);
  }

  @Post('knowledge-items')
  createKnowledge(
    @Body() dto: CreateKnowledgeItemDto,
    @Req() request: RequestWithUser,
  ) {
    return this.service.createKnowledgeItem(dto, request.user.id);
  }

  @Patch('knowledge-items/:id')
  updateKnowledge(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKnowledgeItemDto,
    @Req() request: RequestWithUser,
  ) {
    return this.service.updateKnowledgeItem(id, dto, request.user.id);
  }

  @Delete('knowledge-items/:id')
  deleteKnowledge(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteKnowledgeItem(id);
  }

  @Get('intents')
  listIntents() {
    return this.service.listIntents();
  }

  @Post('intents')
  createIntent(@Body() dto: CreateIntentDto, @Req() request: RequestWithUser) {
    return this.service.createIntent(dto, request.user.id);
  }

  @Patch('intents/:id')
  updateIntent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIntentDto,
    @Req() request: RequestWithUser,
  ) {
    return this.service.updateIntent(id, dto, request.user.id);
  }

  @Post('intents/:intentId/phrases')
  createIntentPhrase(
    @Param('intentId', ParseIntPipe) intentId: number,
    @Body() dto: CreateIntentPhraseDto,
    @Req() request: RequestWithUser,
  ) {
    return this.service.createIntentPhrase(intentId, dto, request.user.id);
  }

  @Patch('intents/:intentId/phrases/:phraseId')
  updateIntentPhrase(
    @Param('intentId', ParseIntPipe) intentId: number,
    @Param('phraseId', ParseIntPipe) phraseId: number,
    @Body() dto: UpdateIntentPhraseDto,
    @Req() request: RequestWithUser,
  ) {
    return this.service.updateIntentPhrase(
      intentId,
      phraseId,
      dto,
      request.user.id,
    );
  }

  @Patch('config')
  updateConfig(
    @Body() dto: UpdateChatbotConfigDto,
    @Req() request: RequestWithUser,
  ) {
    return this.service.updateConfig(dto, request.user.id);
  }
}
