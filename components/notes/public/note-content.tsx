interface NoteContentProps {
    content: string
}

export function NoteContent({ content }: NoteContentProps) {
    return (
        <div className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
            <div className="whitespace-pre-wrap font-sans text-gray-800">
                {content}
            </div>
        </div>
    )
}
