import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const POST = async (req: NextRequest) => {
  const cookiesList = await cookies();
  const refreshToken = cookiesList.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: '리프레시 토큰이 없습니다.' },
      { status: 401 },
    );
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      `${process.env.REFRESH_TOKEN_SECRET}`,
    ) as { email: string };
    const newAccessToken = jwt.sign(
      { email: decoded.email },
      `${process.env.ACCESS_TOKEN_SECRET}`,
      { expiresIn: '15m' },
    );
    const decodedAccessToken = jwt.decode(newAccessToken) as { exp: number };
    const currentTime = Math.trunc(Date.now() / 1000);
    const accessTokenMaxAge = decodedAccessToken.exp - currentTime;

    const res = NextResponse.json({ message: '토큰 갱신 성공' });

    const cookies = res.cookies;
    cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      {
        message: '리프레시 토큰이 유효하지 않거나 만료되었습니다.',
      },
      { status: 401 },
    );
  }
};
