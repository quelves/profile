import { content, Locale } from "@/lib/content-i18n";
import { Mail, Phone, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";

export function Footer({ locale }: { locale: Locale }) {
  const currentYear = new Date().getFullYear();
  const t = content[locale]?.footer || content.en.footer;

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Luiz Quelves Da Silva</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t.bio}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              {t.contact}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:luiz@quelves.com" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  luiz@quelves.com
                </a>
              </li>
              <li>
                <a href="tel:+56996455952" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  +56 9 9645 5952
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  Santiago, Chile
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              {t.social}
            </h3>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/quelves"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <LinkedInIcon className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/quelves"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <GitHubIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© {currentYear} Luiz Quelves Da Silva. {t.rights}</p>
          <p className="mt-1">
            {t.built}
          </p>
        </div>
      </div>
    </footer>
  );
}
