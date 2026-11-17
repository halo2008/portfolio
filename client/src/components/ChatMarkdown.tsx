import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** The assistant's answer as Markdown. Raw HTML in the answer is not rendered (react-markdown escapes it). */
const ChatMarkdown: React.FC<{ text: string }> = ({ text }) => (
    <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
            a: ({ node: _node, ...props }) =>
                props.href?.startsWith('#') ? <a {...props} /> : <a {...props} target="_blank" rel="noopener noreferrer" />
        }}
    >
        {text}
    </Markdown>
);

export default ChatMarkdown;
