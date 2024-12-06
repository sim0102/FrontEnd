import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const PUT = async (
  request: NextRequest,
  { params }: { params: { userId: string } },
) => {
  const { nickname } = await request.json();
  const { userId } = params;

  if (!nickname || nickname.trim().length === 0) {
    return NextResponse.json(
      { message: '닉네임을 입력해주세요.' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.put(
      `${process.env.API_URL}/users/${userId}`, // 백엔드 서버 URL
      { nickname },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 200) {
      const { nickname } = response.data;
    }

    return NextResponse.json({ nickname }, { status: response.status });
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      return NextResponse.json(data, { status });
    }

    // 네트워크 오류 처리
    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
};