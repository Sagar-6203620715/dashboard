import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F4F5FA] flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5570F1] flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.9976 12.037C22.108 12.2616 22.1809 12.5021 22.2135 12.7494L22.8168 21.7192L23.1162 26.2277C23.1193 26.6913 23.1921 27.1519 23.3321 27.5947C23.6938 28.4539 24.5639 28.9999 25.5104 28.9618L39.9346 28.0184C40.5592 28.0081 41.1623 28.2417 41.6114 28.6678C41.9855 29.0229 42.2271 29.4874 42.3032 29.987L42.3288 30.2904C41.7319 38.5556 35.6615 45.4494 27.4134 47.229C19.1654 49.0086 10.7074 45.2493 6.63154 37.9923C5.45651 35.8839 4.72257 33.5665 4.47283 31.1761C4.36849 30.4685 4.32257 29.7537 4.33545 29.0388C4.32257 20.1776 10.6329 12.5167 19.4661 10.6699C20.5292 10.5044 21.5714 11.0672 21.9976 12.037Z"
              fill="#97A5EB"
            />
            <path
              opacity="0.4"
              d="M27.885 4.33511C37.7648 4.58646 46.0683 11.6909 47.6667 21.26L47.6514 21.3306L47.6078 21.4333L47.6139 21.7151C47.5912 22.0885 47.4471 22.4478 47.1986 22.7381C46.9398 23.0404 46.5862 23.2462 46.1968 23.3261L45.9593 23.3587L29.3176 24.437C28.7641 24.4916 28.2129 24.3131 27.8013 23.9459C27.4582 23.6399 27.2389 23.2269 27.1769 22.7818L26.0599 6.1643C26.0405 6.10811 26.0405 6.0472 26.0599 5.99101C26.0752 5.53296 26.2768 5.09999 26.6198 4.78883C26.9627 4.47768 27.4184 4.31427 27.885 4.33511Z"
              fill="#FFCC91"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-3">Nova</h1>
        <p className="text-blue-100 text-center text-lg max-w-xs">
          Create your Nova account and start managing your store.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
