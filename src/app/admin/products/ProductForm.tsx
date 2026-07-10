'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABEL, type ProductCategory, type Product } from '@/types'
import { Upload } from 'lucide-react'

interface Props {
  initialData?: Product
}

export default function ProductForm({ initialData }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [productFile, setProductFile] = useState<File | null>(null)
  const thumbnailRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isEdit = !!initialData

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = new FormData()

    body.append('title', form.get('title') as string)
    body.append('description', form.get('description') as string)
    body.append('price', form.get('price') as string)
    body.append('category', form.get('category') as string)
    body.append('tags', form.get('tags') as string)
    body.append('is_published', form.get('is_published') === 'on' ? 'true' : 'false')

    if (thumbnailFile) body.append('thumbnail', thumbnailFile)
    if (productFile) body.append('file', productFile)
    if (isEdit) body.append('id', initialData.id)
    if (isEdit && !productFile) body.append('file_path', initialData.file_path)

    const res = await fetch('/api/admin/products', {
      method: isEdit ? 'PUT' : 'POST',
      body,
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '저장에 실패했어요.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleDelete() {
    if (!initialData || !confirm('정말 삭제하시겠어요?')) return
    setLoading(true)
    const res = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: initialData.id }),
    })
    if (!res.ok) { setError('삭제에 실패했어요.'); setLoading(false); return }
    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <Field label="상품명" required>
        <input name="title" required defaultValue={initialData?.title} placeholder="예: Claude 프롬프트 마스터팩"
          className="input" />
      </Field>

      <Field label="카테고리" required>
        <select name="category" required defaultValue={initialData?.category ?? 'prompt'} className="input">
          {(Object.entries(CATEGORY_LABEL) as [ProductCategory, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </Field>

      <Field label="가격 (원, 0 = 무료)" required>
        <input name="price" type="number" min={0} step={100} required defaultValue={initialData?.price ?? 0}
          className="input" />
      </Field>

      <Field label="상세 설명" required>
        <textarea name="description" required rows={5} defaultValue={initialData?.description}
          placeholder="상품 설명을 입력하세요" className="input resize-none" />
      </Field>

      <Field label="태그 (쉼표로 구분)">
        <input name="tags" defaultValue={initialData?.tags?.join(', ')}
          placeholder="예: claude, 글쓰기, 마케팅" className="input" />
      </Field>

      {/* 썸네일 업로드 */}
      <Field label={`썸네일 이미지${isEdit ? ' (변경 시에만)' : ''}`}>
        <div
          onClick={() => thumbnailRef.current?.click()}
          className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors"
        >
          <Upload size={20} className="text-gray-400" />
          <p className="text-sm text-gray-500">
            {thumbnailFile ? thumbnailFile.name : '클릭해서 이미지 선택'}
          </p>
        </div>
        <input ref={thumbnailRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)} />
      </Field>

      {/* 상품 파일 업로드 */}
      <Field label={`상품 파일${isEdit ? ' (변경 시에만)' : ''} *`}>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors"
        >
          <Upload size={20} className="text-gray-400" />
          <p className="text-sm text-gray-500">
            {productFile ? productFile.name : isEdit ? `현재: ${initialData?.file_path.split('/').pop()}` : '클릭해서 파일 선택'}
          </p>
        </div>
        <input ref={fileRef} type="file" className="hidden"
          onChange={(e) => setProductFile(e.target.files?.[0] ?? null)} />
      </Field>

      {/* 공개 여부 */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input name="is_published" type="checkbox" defaultChecked={initialData?.is_published ?? false}
          className="w-4 h-4 accent-indigo-600" />
        <span className="text-sm font-medium text-gray-700">즉시 공개</span>
      </label>

      <div className="flex gap-3 mt-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors">
          {loading ? '저장 중...' : isEdit ? '수정 저장' : '상품 등록'}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={loading}
            className="px-5 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 disabled:opacity-60 transition-colors">
            삭제
          </button>
        )}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
      `}</style>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
