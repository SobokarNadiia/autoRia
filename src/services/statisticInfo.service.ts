import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { CarAd, Views } from "../models";
import { ICarAd } from "../types";

dayjs.extend(utc);

class StatisticInfoService {
  public async addView(carAdId: string): Promise<void> {
    await Views.create({ _carAdId: carAdId });
  }

  public async getStatisticInfo(carAdId: string, carAd: ICarAd) {
    const month = dayjs().utc().subtract(1, "month");
    const week = dayjs().utc().subtract(1, "week");
    const day = dayjs().utc().subtract(24, "hours");

    const { model, brand, city } = carAd;

    const [
      viewsTotal,
      viewsMonth,
      viewsWeek,
      viewsDay,
      avgCityPrice,
      averagePrice,
    ] = await Promise.all([
      Views.find({ _carAdId: carAdId }).count(),
      Views.find({ _carAdId: carAdId, createdAt: { $gte: month } }).count(),
      Views.find({ _carAdId: carAdId, createdAt: { $gte: week } }).count(),
      Views.find({ _carAdId: carAdId, createdAt: { $gte: day } }).count(),
      CarAd.aggregate([
        {
          $match: {
            brand,
            model,
            city,
          },
        },
        {
          $group: {
            _id: null,
            average: {
              $avg: "$price",
            },
          },
        },
      ]),
      CarAd.aggregate([
        {
          $match: {
            brand,
            model,
          },
        },
        {
          $group: {
            _id: null,
            average: {
              $avg: "$price",
            },
          },
        },
      ]),
    ]);

    return {
      viewsTotal,
      viewsDay,
      viewsWeek,
      viewsMonth,
      avgCityPrice,
      averagePrice,
    };
  }
}

export const statisticInfoService = new StatisticInfoService();
