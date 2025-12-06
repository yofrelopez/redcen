interface SocialFormProps {
    defaultValues: {
        facebook?: string | null
        twitter?: string | null
        instagram?: string | null
        youtube?: string | null
    }
}

export function SocialForm({ defaultValues }: SocialFormProps) {
    return (
        <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900">Redes Sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                    <input
                        type="url"
                        name="facebook"
                        defaultValue={defaultValues.facebook || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="https://facebook.com/..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X URL</label>
                    <input
                        type="url"
                        name="twitter"
                        defaultValue={defaultValues.twitter || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="https://twitter.com/..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                    <input
                        type="url"
                        name="instagram"
                        defaultValue={defaultValues.instagram || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="https://instagram.com/..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                    <input
                        type="url"
                        name="youtube"
                        defaultValue={defaultValues.youtube || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="https://youtube.com/..."
                    />
                </div>
            </div>
        </div>
    )
}
