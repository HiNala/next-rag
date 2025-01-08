import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

type MarkdownComponentProps = {
  children?: React.ReactNode;
  className?: string;
};

export function MarkdownMessage({ content, role }: MarkdownMessageProps) {
  const isLongMessage = content.split('\n').length > 4 || content.length > 200;

  if (!isLongMessage) {
    return (
      <div className={`message-bubble ${role === 'user' ? 'message-user' : 'message-assistant'}`}>
        <div className="text-base whitespace-pre-line">{content}</div>
      </div>
    );
  }

  const components: Components = {
    h2: ({ children }: MarkdownComponentProps) => (
      <h2 className="text-lg font-semibold mb-2">{children}</h2>
    ),
    p: ({ children }: MarkdownComponentProps) => <p className="mb-2">{children}</p>,
    ul: ({ children }: MarkdownComponentProps) => <ul className="mb-2 space-y-1">{children}</ul>,
    ol: ({ children }: MarkdownComponentProps) => <ol className="mb-2 space-y-1">{children}</ol>,
    li: ({ children }: MarkdownComponentProps) => <li className="ml-4">{children}</li>,
    strong: ({ children }: MarkdownComponentProps) => (
      <strong className="font-semibold">{children}</strong>
    ),
    hr: () => <hr className="my-3 border-t border-border" />,
    code: ({ children }: MarkdownComponentProps) => (
      <code className="px-1 py-0.5 bg-secondary/50 rounded text-sm">{children}</code>
    ),
  };

  return (
    <div className={`message-bubble ${role === 'user' ? 'message-user' : 'message-assistant'}`}>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
