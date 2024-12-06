import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { useAuthStore } from '@/store/authStore';

export const POST = async (req: NextRequest) => {
  const { email, password } = await req.json();

  try {
    // 1. 로그인 요청
    const response = await axios.post(
      `${process.env.API_URL}/auth/sign-in`, // 실제 백엔드 API 경로
      { email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        // withCredentials: true // 서버에서 보낸 쿠키를 클라이언트에서 자동으로 받아서 저장
      },
    );

    if (response.status === 200) {
      const { accessToken, refreshToken } = response.data;

      // 2. JWT payload에서 userId(sub) 추출
      const decodedAccessToken = jwt.decode(accessToken) as jwt.JwtPayload;
      if (!decodedAccessToken || !decodedAccessToken.sub) {
        throw new Error('액세스토큰에서 userId(sub)를 추출할 수 없습니다.');
      }

      const userId = decodedAccessToken.sub;

      // 3. 회원 정보 조회 요청
      const userResponse = await axios.get(
        `${process.env.API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const userInfo = userResponse.data;

      // 4. 전역 상태에 저장
      const { setIsSignedIn, setUserInfo } = useAuthStore();
      setIsSignedIn(true);
      setUserInfo(userInfo);

      // 5. 쿠키 설정
      const res = NextResponse.json({ message: '로그인 성공', userInfo });

      const currentTime = Math.trunc(Date.now() / 1000);
      const bufferTime = 10;

      if (!decodedAccessToken.exp) {
        throw new Error('액세스토큰 exp 클레임이 없습니다.');
      }

      const accessTokenMaxAge = Math.max(
        decodedAccessToken.exp - currentTime - bufferTime,
        0,
      );

      const decodedRefreshToken = jwt.decode(refreshToken) as jwt.JwtPayload;
      if (!decodedRefreshToken || !decodedRefreshToken.exp) {
        throw new Error('리프레시토큰 exp 클레임이 없습니다.');
      }
      const refreshTokenMaxAge = Math.max(
        decodedRefreshToken.exp - currentTime - bufferTime,
        0,
      );

      const cookies = res.cookies;
      cookies.set('accessToken', accessToken, {
        httpOnly: true, // 클라이언트 자바스크립트에서는 접근 불가(보안상의 이유)
        secure: process.env.NODE_ENV === 'production', // https 일때만 전송
        path: '/', // 쿠키의 유효 경로
        sameSite: 'strict', // CSRF 보호
        maxAge: accessTokenMaxAge, // 액세스토큰 유효기간
      });
      cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: refreshTokenMaxAge, // 리프레시토큰 유효기간
      });

      return res;
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
};