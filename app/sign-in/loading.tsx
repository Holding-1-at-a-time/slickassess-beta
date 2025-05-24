export default function SignInLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="animate-pulse mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="h-10 bg-gray-200 rounded-t-md"></div>
            <div className="h-10 bg-gray-200 rounded-b-md"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}
