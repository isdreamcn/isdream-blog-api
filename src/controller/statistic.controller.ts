import { Controller, Get, Inject } from '@midwayjs/decorator';
import { StatisticService } from '../service/statistic.service';
import { Role } from '../decorator/role.decorator';

@Controller('/statistic')
export class StatisticController {
  @Inject()
  statisticService: StatisticService;

  @Role(['pc'])
  @Get('/pigeonhole')
  async findPigeonhole() {
    return await this.statisticService.findPigeonhole();
  }

  @Role(['pc'])
  @Get('/total')
  async typeTotal() {
    const data = await this.statisticService.typeTotal();
    return {
      data,
    };
  }

  @Role(['pc'])
  @Get('/trend')
  async findArticlesTrend() {
    const data = await this.statisticService.findArticlesTrend();
    return {
      data,
    };
  }
}
