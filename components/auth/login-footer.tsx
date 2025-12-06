export function LoginFooter() {
    return (
        <div className="px-8 pb-8 text-center">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">
                        Credenciales de Demo
                    </span>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 py-2 px-4 rounded-lg border border-gray-100 inline-block">
                <p>Email: <span className="font-mono text-gray-700">admin@redcen.com</span></p>
                <p>Pass: <span className="font-mono text-gray-700">password123</span></p>
            </div>
        </div>
    )
}
