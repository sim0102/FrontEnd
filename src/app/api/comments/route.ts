import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST(req: NextRequest) {
  // const cookieStore = await cookies();
  // const accessToken = cookieStore.get('accessToken')?.value;

  // if (!accessToken) {
  //   return NextResponse.json(
  //     { message: '인증이 필요합니다.' },
  //     { status: 401 },
  //   );
  // }

  try {
    const body = await req.json();
    const postType = body.postType.toLowerCase();
    const postId = body.postId;

    const response = await axios.post(
      `${process.env.API_URL}/${postType}-posts/${postId}/comments`,
      {
        content: body.content,
        isSecret: body.isSecret,
      },
    );

    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json(
      { message: '댓글 작성에 실패했습니다.' },
      { status: 500 },
    );
  }
}
