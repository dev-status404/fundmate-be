import { Router } from 'express';
import { serviceClients } from '@shared/config';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: '결제 서버 api작성 공간' });
});
router.get('/request-other-service', async (req, res) => {
  // 1. serviceConfig를 통해 불러올 서버정보를 꺼내옴, 들어가서 코드를 확인하면 다른 옵션들도 있긴한데, 대부분 url을 위해 존재하는 요소들이기에 url만 사용하시면 됩니다.
  // ex. 원하는 서버에 Path를 추가하여 원하는 정보 꺼내기
  const response = await serviceClients['funding-service'].get('/projects/:id');
  console.log(response.data);
  // npm run start:all을 해서 http://localhost:3003/projects/3 이나 http://localhost:3000/projects/3을 열면 'funding detail'가 나오는 것을 확인할 수 있다.
  return res.status(200).json({ isOterServiceMessage: response.data });
});

export default router;
