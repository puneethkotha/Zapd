import { createUploadthing } from "uploadthing/next"
import type { FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  stationImage: f({ image: { maxFileSize: "4MB", maxFileCount: 6 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
