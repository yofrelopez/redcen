import Link from "next/link"
import Image from "next/image"
import { SITE_NAME } from "@/lib/seo"
import { Mail, Phone, ExternalLink } from "lucide-react"
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaWhatsapp } from "react-icons/fa6"

export function FooterPublic() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-900">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 pt-20 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Brand Column (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="inline-block group">
                            <div className="relative h-12 w-48">
                                <Image
                                    src="/images/logo_claro_2.png"
                                    alt={SITE_NAME}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            La plataforma definitiva para la gestión y distribución de notas de prensa corporativas. Conectamos instituciones con periodistas y audiencias clave en tiempo real.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <SocialButton href="#" icon={FaFacebookF} label="Facebook" />
                            <SocialButton href="#" icon={FaInstagram} label="Instagram" />
                            <SocialButton href="#" icon={FaXTwitter} label="X (Twitter)" />
                            <SocialButton href="#" icon={FaLinkedinIn} label="LinkedIn" />
                        </div>
                    </div>

                    {/* Links Grid (5 cols total) */}
                    <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {/* Column 1 */}
                        <div>
                            <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Plataforma</h4>
                            <ul className="space-y-4">
                                <FooterLink href="/explorar">Explorar</FooterLink>
                                <FooterLink href="/instituciones">Directorio</FooterLink>
                                <FooterLink href="/precios">Planes</FooterLink>
                                <FooterLink href="/publicar" highlight>Publicar Nota</FooterLink>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Empresa</h4>
                            <ul className="space-y-4">
                                <FooterLink href="/nosotros">Nosotros</FooterLink>
                                <FooterLink href="/blog">Blog</FooterLink>
                                <FooterLink href="/prensa">Sala de Prensa</FooterLink>
                                <FooterLink href="/contacto">Contacto</FooterLink>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Legal</h4>
                            <ul className="space-y-4">
                                <FooterLink href="/terminos">Términos</FooterLink>
                                <FooterLink href="/privacidad">Privacidad</FooterLink>
                                <FooterLink href="/cookies">Cookies</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Column (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Contacto Directo</h4>
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Correo Electrónico</p>
                                    <a href="mailto:contacto@redcen.com" className="text-sm font-semibold text-white hover:text-blue-400 transition-colors block">
                                        contacto@redcen.com
                                    </a>
                                </div>
                            </div>

                            <div className="h-px bg-slate-800" />

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-400 mt-1">
                                    <FaWhatsapp className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">WhatsApp</p>
                                    <a
                                        href="https://wa.me/51998136138"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-white hover:text-green-400 transition-colors block flex items-center gap-2"
                                    >
                                        998 136 138
                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-900 bg-slate-950">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                        {/* Copyright */}
                        <div className="text-xs text-slate-500 font-medium">
                            <span className="opacity-80">© {currentYear} {SITE_NAME}.</span>
                            <span className="hidden sm:inline opacity-50 mx-2">|</span>
                            <span className="opacity-60">Todos los derechos reservados.</span>
                        </div>

                        {/* Developer Credit */}
                        <div className="flex items-center gap-2 group">
                            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold group-hover:text-slate-500 transition-colors">
                                Desarrollado por
                            </span>
                            <a
                                href="https://idev.pe"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 transition-all duration-300 group/dev"
                            >
                                <span className="text-sm font-black text-[#F44E00] group-hover/dev:scale-105 transition-transform">
                                    iDev
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialButton({ href, icon: Icon, label }: { href: string; icon: any, label: string }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 text-white border border-slate-700 hover:bg-[#F44E00] hover:border-[#F44E00] transition-all duration-300 shadow-sm"
        >
            <Icon className="w-4 h-4" />
        </a>
    )
}

function FooterLink({ href, children, highlight }: { href: string; children: React.ReactNode, highlight?: boolean }) {
    return (
        <li>
            <Link
                href={href}
                className={`text-sm transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2
                    ${highlight
                        ? 'text-white font-medium hover:text-[#F44E00]'
                        : 'text-slate-400 hover:text-white'
                    }`}
            >
                {children}
            </Link>
        </li>
    )
}
