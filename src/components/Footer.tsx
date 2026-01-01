import { Link } from "react-router-dom";
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail,
  MapPin,
  Shield,
  Globe
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold">LINKSY</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              The intelligent commerce platform that empowers entrepreneurs to build, scale, and secure their online business.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">Product</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Features</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Dashboard</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Product Intelligence</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Recycling Program</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">Company</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">About Us</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Careers</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Press</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Partners</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Help Center</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Documentation</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Seller Academy</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Webinars</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Cookie Policy</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Compliance</Link></li>
              <li><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">GDPR</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <span>Multi-Market</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>EU, UAE, Africa</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} LINKSY. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
