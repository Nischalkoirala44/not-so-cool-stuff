import Image from "next/image"

type Blog = {
  file: string
  caption: string
  type: "image" | "video"
  date: string
}

async function getBlogs(): Promise<Blog[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/upload`, {
    cache: "no-store",
  })
  const data = await res.json()
  return data.uploads || []
}

export default async function Home() {
  const blogs = await getBlogs()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Nischal&apos;s Gameplay</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <article
              key={idx}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-700"
            >
              <div className="relative">
                {blog.type === "image" ? (
                  <Image src={`/${blog.file}`} alt={blog.caption} className="w-full h-64 object-cover" />
                ) : (
                  <video controls className="w-full h-64 object-cover">
                    <source src={`/${blog.file}`} type="video/mp4" />
                  </video>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-3">{blog.caption}</h2>
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatDate(blog.date)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
