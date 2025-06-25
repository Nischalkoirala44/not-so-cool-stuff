"use client"

import type React from "react"
import { useState } from "react"

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [type, setType] = useState<"image" | "video">("image")
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!file || !caption.trim()) {
      setMessage("Please select a file and enter a caption")
      return
    }

    setIsUploading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("caption", caption.trim())
    formData.append("type", type)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(`Upload failed: ${data.message || res.statusText}`)
        return
      }

      setMessage(data.message || "Upload complete")
      setCaption("")
      setFile(null)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    } catch (error) {
      setMessage("Upload failed: Network or server error")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        setType("image")
      } else if (selectedFile.type.startsWith("video/")) {
        setType("video")
      }
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Upload</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select File</label>
          <input
            type="file"
            accept={type === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "image" | "video")}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isUploading}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Caption</label>
          <input
            type="text"
            placeholder="Enter a caption for your content"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isUploading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || !file || !caption.trim()}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>

        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-center ${
              message.includes("failed") || message.includes("error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
