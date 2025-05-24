export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">
              <span className="text-[#00ae98]">Nexus</span>Tech
            </h3>
            <p className="text-sm text-gray-400">
              Elevating digital experiences with cutting-edge technology and innovative solutions.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-gray-400">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-gray-400">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-gray-400">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00ae98]">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} NexusTech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
