import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const ALLOWED_BUCKETS = new Set(['avatars', 'project-files'])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function ensureBucket(bucketName: string): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const exists = buckets?.some(b => b.name === bucketName)
    
    if (exists) {
      return true
    }

    // Create bucket if it doesn't exist
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
    })

    if (error) {
      console.warn(`Failed to create bucket ${bucketName}:`, error.message)
      return false
    }

    return !!data
  } catch (err) {
    console.warn(`Error ensuring bucket ${bucketName}:`, err)
    return false
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const bucket = String(formData.get('bucket') ?? 'project-files')

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: 'Invalid upload bucket' }, { status: 400 })
  }

  // Ensure bucket exists (important for local dev)
  const bucketReady = await ensureBucket(bucket)
  if (!bucketReady) {
    return NextResponse.json(
      { error: 'Failed to initialize upload bucket. Please try again.' },
      { status: 500 }
    )
  }

  const files = formData.getAll('files').filter((item): item is File => item instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const uploadedUrls: string[] = []
  const uploadErrors: string[] = []
  const folder = bucket === 'avatars' ? 'avatars' : 'project-files'

  for (const file of files.slice(0, 5)) {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      uploadErrors.push(`${file.name}: File size exceeds 10MB limit`)
      continue
    }

    if (file.size === 0) {
      uploadErrors.push(`${file.name}: File is empty`)
      continue
    }
    const extension = file.name.includes('.') ? file.name.split('.').pop() : ''
    const safeName = sanitizeFileName(file.name || 'upload')
    const uniqueName = `${session.user.id}/${folder}/${randomUUID()}-${safeName}${extension && !safeName.endsWith(`.${extension}`) ? `.${extension}` : ''}`

    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(uniqueName, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (error) {
        uploadErrors.push(`${file.name}: ${error.message}`)
        continue
      }

      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(uniqueName)
      uploadedUrls.push(data.publicUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      uploadErrors.push(`${file.name}: ${message}`)
      continue
    }
  }

  if (uploadedUrls.length === 0) {
    const errorMessage = uploadErrors.length > 0 
      ? uploadErrors.join('; ')
      : 'Upload failed. Please check file size and type.'
    return NextResponse.json(
      { error: errorMessage, uploadErrors },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    urls: uploadedUrls,
    errors: uploadErrors,
  })
}