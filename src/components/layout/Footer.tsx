import { Mail, MapPin, Phone, Instagram, Facebook, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="section-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/icon.png"
                alt="NUGSA-Germany Logo"
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-white">NUGSA-Germany</h3>
                <p className="text-sm text-gray-400">National Union of Ghanaian Student Associations</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Empowering Ghanaian students across Germany through community, support, and academic excellence.
              Building bridges between cultures and fostering professional growth.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/nugsagermany?igsh=MWNrYjFpYWdiNHZrNQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/groups/716219789172147/?ref=share"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@nugsagermany?_r=1&_t=ZN-91se3sn72o7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <Video className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/students" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Student Directory
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.announcements')}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Support Fund
                </Link>
              </li>
              <li>
                <Link to="/assistance" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Get Assistance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a href="mailto:info@nugsa.de" className="text-gray-300 hover:text-white transition-colors text-sm">
                    info@nugsa.de
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-gray-300 text-sm">Germany</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Support</p>
                  <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                    {t('nav.contact')}
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} <span className="text-white font-semibold">NUGSA-Germany</span>. {t('footer.allRightsReserved')}.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link to="/about" className="hover:text-white transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
