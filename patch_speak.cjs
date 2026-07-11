const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistant.tsx', 'utf8');

code = code.replace(
  "const speakText = (text: string) => {",
  "const speakText = (text: string, force = false) => {"
);

code = code.replace(
  "if (isMuted) return;",
  "if (isMuted && !force) return;"
);

code = code.replace(
  "onClick={() => speakText(msg.text)}",
  "onClick={() => speakText(msg.text, true)}"
);

fs.writeFileSync('src/components/ChatAssistant.tsx', code);
