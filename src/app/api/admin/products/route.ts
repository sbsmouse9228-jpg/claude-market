import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getAdmin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== process.env.ADMIN_USER_ID) return null
  return user
}

// 상품 등록
export async function POST(req: Request) {
  if (!await verifyAdmin()) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  const admin = getAdmin()
  const formData = await req.formData()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string)
  const category = formData.get('category') as string
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const is_published = formData.get('is_published') === 'true'
  const file = formData.get('file') as File | null
  const thumbnail = formData.get('thumbnail') as File | null

  if (!file) return NextResponse.json({ error: '상품 파일이 필요해요.' }, { status: 400 })

  // 임시 product ID 생성
  const productId = crypto.randomUUID()

  // 파일 업로드 (private bucket)
  const fileExt = file.name.split('.').pop()
  const filePath = `${productId}/file.${fileExt}`
  const { error: fileError } = await admin.storage
    .from('product-files')
    .upload(filePath, file, { contentType: file.type })

  if (fileError) return NextResponse.json({ error: '파일 업로드 실패: ' + fileError.message }, { status: 500 })

  // 썸네일 업로드 (public bucket)
  let thumbnail_url: string | null = null
  if (thumbnail) {
    const thumbExt = thumbnail.name.split('.').pop()
    const thumbPath = `${productId}/thumbnail.${thumbExt}`
    const { error: thumbError } = await admin.storage
      .from('product-images')
      .upload(thumbPath, thumbnail, { contentType: thumbnail.type })

    if (!thumbError) {
      const { data: urlData } = admin.storage.from('product-images').getPublicUrl(thumbPath)
      thumbnail_url = urlData.publicUrl
    }
  }

  const { error: dbError } = await admin.from('products').insert({
    id: productId,
    title, description, price, category, tags, is_published,
    file_path: filePath,
    thumbnail_url,
  })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// 상품 수정
export async function PUT(req: Request) {
  if (!await verifyAdmin()) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  const admin = getAdmin()
  const formData = await req.formData()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string)
  const category = formData.get('category') as string
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const is_published = formData.get('is_published') === 'true'
  const file = formData.get('file') as File | null
  const thumbnail = formData.get('thumbnail') as File | null
  let file_path = formData.get('file_path') as string

  // 새 파일이 있으면 업로드
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    file_path = `${id}/file.${fileExt}`
    await admin.storage.from('product-files').upload(file_path, file, { contentType: file.type, upsert: true })
  }

  let thumbnail_url: string | undefined
  if (thumbnail && thumbnail.size > 0) {
    const thumbExt = thumbnail.name.split('.').pop()
    const thumbPath = `${id}/thumbnail.${thumbExt}`
    const { error } = await admin.storage.from('product-images').upload(thumbPath, thumbnail, { contentType: thumbnail.type, upsert: true })
    if (!error) {
      const { data } = admin.storage.from('product-images').getPublicUrl(thumbPath)
      thumbnail_url = data.publicUrl
    }
  }

  const updateData: Record<string, unknown> = { title, description, price, category, tags, is_published, file_path }
  if (thumbnail_url) updateData.thumbnail_url = thumbnail_url

  const { error } = await admin.from('products').update(updateData).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// 상품 삭제
export async function DELETE(req: Request) {
  if (!await verifyAdmin()) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  const admin = getAdmin()
  const { id } = await req.json()

  // Storage 파일 삭제
  const { data: files } = await admin.storage.from('product-files').list(id)
  if (files?.length) {
    await admin.storage.from('product-files').remove(files.map(f => `${id}/${f.name}`))
  }
  const { data: images } = await admin.storage.from('product-images').list(id)
  if (images?.length) {
    await admin.storage.from('product-images').remove(images.map(f => `${id}/${f.name}`))
  }

  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
