// import { HttpStatusCode } from "axios";
import { Request, Response } from 'express';

export const getDataByOption = (req: Request, res: Response) => {
  return res.send('옵션별 공공데이터 가져오기');
};

export const getDataByKeyword = (req: Request, res: Response) => {
  return res.send('키워드로 공공데이터 가져오기');
};
