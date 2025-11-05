export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for submitting your water service request.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-6 text-left">
          <h2 className="font-semibold text-gray-900 mb-3">What happens next?</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              <span>We'll review your application within 1-2 business days</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              <span>You'll receive an email confirmation with your application details</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                3
              </span>
              <span>If approved, we'll contact you to schedule service activation</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                4
              </span>
              <span>Payment for deposit (if required) will be requested before activation</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 text-sm text-gray-700">
          <p className="font-medium mb-1">📧 Check your email</p>
          <p>
            A confirmation email has been sent to the email address you provided.
            If you don't receive it within 24 hours, please check your spam folder.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Submit Another Request
          </a>
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Contact Support
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Questions? Call us at (555) 123-4567 or email support@txwaterservice.com
        </p>
      </div>
    </div>
  );
}
