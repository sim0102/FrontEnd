'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function InfoEditPage() {
  const params = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { isSignedIn, userInfo } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/signin');
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/info-posts/${params.id}`,
        );
        const post = response.data;

        if (userInfo?.id !== post.userId) {
          alert('수정 권한이 없습니다.');
          router.push('/community/info');
          return;
        }

        setTitle(post.title);
        setDescription(post.description);
        if (post.thumbnailImgUrl) {
          setFilePreview(post.thumbnailImgUrl);
        }
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        router.push('/community/info');
      }
    };

    fetchPost();
  }, [isSignedIn, params.id, router, userInfo?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const fileInput = (e.target as HTMLFormElement).querySelector(
        'input[name="file"]',
      ) as HTMLInputElement;
      const file = fileInput.files?.[0];

      if (file) {
        formData.append('file', file);
      }

      formData.append('title', title);
      formData.append('description', description);
      formData.append('userId', userInfo?.id.toString() || '');

      if (filePreview && !file) {
        formData.append('thumbnailImgUrl', filePreview);
      }

      await axios.post(`/api/info-posts/${params.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push(`/community/info/${params.id}`);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">이미지</span>
        </label>
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full"
        />
        {filePreview && (
          <div className="mt-2">
            <img
              src={filePreview}
              alt="이미지 미리보기"
              className="w-full max-w-xs rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">제목</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input input-bordered"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">내용</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="textarea textarea-bordered h-32"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        수정하기
      </button>
    </form>
  );
}
