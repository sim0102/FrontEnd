import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const id = request.nextUrl.pathname.split('/')[3];

  if (!accessToken) {
    return NextResponse.json(
      { message: '인증이 필요합니다.' },
      { status: 401 },
    );
  }

  try {
    const response = await axios.patch(
      `${process.env.API_URL}/study-posts/${id}/close`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('스터디 모집 마감 실패:', error);
    return NextResponse.json(
      { message: '스터디 모집 마감에 실패했습니다.' },
      { status: 500 },
    );
  }
}
