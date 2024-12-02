'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { SiNaver } from 'react-icons/si';
import { RiKakaoTalkFill } from 'react-icons/ri';

const SingInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const router = useRouter();

  const handleSignInSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const response = await axios.post(
        '/api/auth/sign-in',
        {
          email,
          password,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true, // 쿠키를 포함해 요청
        },
      );

      if (response.status === 200) {
        const { accessToken, refreshToken } = response.data;
        router.push('/community/study');
      }
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        const errorCode = data?.errorCode;

        if (status === 401) {
          setError(
            '이메일 혹은 비밀번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.',
          );
        } else if (status === 403) {
          setError('탈퇴한 계정입니다.');
        } else if (status === 404) {
          setError('해당 이메일로 가입된 계정이 없습니다.');
        } else {
          setError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setError('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">로그인</h1>
      <form onSubmit={handleSignInSubmit} className="w-full">
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 font-semibold">
            이메일
          </label>
          <div className="flex items-center">
            <input
              id="email"
              type="email"
              value={email}
              placeholder="이메일을 입력해 주세요."
              onChange={e => {
                setEmail(e.target.value);
              }}
              required
              className="flex-grow px-4 py-2 rounded border bg-white focus:outline-indigo-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 font-semibold">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해 주세요."
            required
            className="w-full px-4 py-2 rounded border bg-white focus:outline-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          로그인
        </button>
      </form>
      <div className="mt-4 w-full">
        <button
          name="Google"
          className="flex items-center justify-center w-full px-4 py-2 text-white bg-green-500 border border-gray-300 rounded-md hover:bg-green-600"
        >
          <SiNaver className="mr-2 text-white" size={16} />
          <span className="font-midium">Naver</span> 로그인
        </button>
        <button
          name="Kakao"
          className="mt-4 flex items-center justify-center w-full px-4 py-2 text-yellow-950 bg-yellow-300 border border-gray-300 rounded-md hover:bg-yellow-400 hover:"
        >
          <RiKakaoTalkFill className="mr-2 text-yellow-950" size={24} />
          <span className="font-medium">Kakao</span> 로그인
        </button>
      </div>
    </div>
  );
};

export default SingInPage;