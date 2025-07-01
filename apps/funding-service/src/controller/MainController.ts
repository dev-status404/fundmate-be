import { Request, Response } from 'express';

export const getAllProjects = (req: Request, res: Response) => {

  // "title": "제목",
	// "description": "설명입니당",
	// "achievement": 100               // goal_amount / current_amount AS achievement (퍼센트)
	// "current_amount": 1000000
	// "remaining_day": 1               // DATEDIFF(end_date, CURRENT_DATE) AS remaining_day (남은 기간)

  // const achievement = 

  res.send('main api');
};

export const getMyFundingList = (req: Request, res: Response) => {
  res.send('My uploaded funding list');
};

export const getRecentFinishedFundingById = (req: Request, res: Response) => {
  res.send('Recently completed funding');
};
