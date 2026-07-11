const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistant.tsx', 'utf8');

code = code.replace(
  "className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}",
  "className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}"
);

code = code.replace(
  `                    ) : (\n                      <div className="markdown-body prose prose-invert prose-sm max-w-none">\n                        <ReactMarkdown>{msg.text}</ReactMarkdown>\n                      </div>\n                    )}`,
  `                    ) : (
                      <div className="relative">
                        <div className="markdown-body prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        {msg.role === 'ai' && (
                          <button 
                            onClick={() => speakText(msg.text)} 
                            className="absolute -bottom-6 -right-2 p-1.5 bg-[#FF3B30]/20 border border-[#FF3B30]/50 text-[#FF3B30] rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all hover:bg-[#FF3B30] hover:text-white"
                            title="Replay Voice"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                      </div>
                    )}`
);

fs.writeFileSync('src/components/ChatAssistant.tsx', code);
